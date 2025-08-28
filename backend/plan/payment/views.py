import stripe
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from user.type.student_user.models import Student
from plan.models import Plan, PlanPricing
from invoice.models import Invoice, InvoiceCustomer, InvoiceItem
from invoice.utils import InvoiceGenerator
from plan.subscription.utils import (
    subscribe,
    subscribe_free_plan,
    unsubscribe_free_plan,
)
from const import SubscriptionStatus, PaymentStatus, PaymentMethod, Language
from global_config import CONFIG
from mailer.mailer import Mailer
from utils.url.url import get_website_url

stripe.api_key = CONFIG["stripe_secret_key"]


class CreateSetupIntentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            student = Student.objects.get(user=request.user)

            plan_type = request.data.get("type")
            interval = request.data.get("interval")
            currency = request.data.get("currency")
            language = request.LANGUAGE_CODE
            website_url = get_website_url(request)

            plan = get_object_or_404(Plan, type=plan_type)

            pricing = PlanPricing.get_current_price(
                plan=plan, currency=currency, interval=interval
            )

            if not student.stripe_customer_id:
                customer = stripe.Customer.create(email=student.user.email)
                student.stripe_customer_id = customer.id
                student.save()
            else:
                customer = {"id": student.stripe_customer_id}

            setup_intent = stripe.SetupIntent.create(
                customer=customer["id"],
                metadata={
                    "price_id": pricing.stripe_price_id,
                    "language": language,
                    "website_url": website_url,
                },
            )
            client_secret = setup_intent.client_secret

            return Response(
                {
                    "client_secret": client_secret,
                }
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
        endpoint_secret = CONFIG["stripe_webhook_secret"]

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        data = event["data"]["object"]
        event_type = event["type"]

        if event_type == "customer.subscription.created":
            self.handle_subscription_created(data)
        elif event_type == "customer.subscription.updated":
            self.handle_subscription_updated(data)
        elif event_type == "invoice.payment_succeeded":
            self.handle_invoice_payment_succeeded(data)
        elif event_type == "invoice.payment_failed":
            self.handle_invoice_payment_failed(data)
        elif event_type == "setup_intent.succeeded":
            self.handle_setup_intent_succeeded(data)

        return Response(status=status.HTTP_200_OK)

    def handle_setup_intent_succeeded(self, data):
        print(data)
        customer_id = data["customer"]
        price_id = data["metadata"]["price_id"]
        language = data["metadata"]["language"]
        website_url = data["metadata"]["website_url"]
        payment_method_id = data.get("payment_method")

        payment_method = stripe.PaymentMethod.retrieve(payment_method_id)
        billing_details = payment_method.get("billing_details", {})

        stripe.Customer.modify(
            customer_id,
            name=billing_details.get("name"),
            address=billing_details.get("address"),
            phone=billing_details.get("phone"),
            tax_id=billing_details.get("tax_id"),
        )

        stripe.Subscription.create(
            customer=customer_id,
            items=[
                {"price": price_id, "language": language, "website_url": website_url}
            ],
            trial_period_days=7,
            payment_behavior="default_incomplete",
            expand=["latest_invoice.payment_intent"],
            metadata={"price_id": price_id},
        )

    def handle_subscription_created(self, data):
        subscription_id = data["id"]
        customer_id = data["customer"]
        price_id = data["metadata"]["price_id"]
        status = data["status"]
        current_period_start = data["items"]["data"][0]["current_period_start"]
        current_period_end = data["items"]["data"][0]["current_period_end"]
        start_date = timezone.datetime.fromtimestamp(
            current_period_start, tz=timezone.utc
        )
        end_date = timezone.datetime.fromtimestamp(current_period_end, tz=timezone.utc)

        plan_pricing = PlanPricing.objects.get(stripe_price_id=price_id)

        student = Student.objects.get(stripe_customer_id=customer_id)

        print(status)

        if status == "trialing":
            # User started trial
            unsubscribe_free_plan(student)
            subscribe(
                student,
                plan_pricing.plan,
                plan_pricing=plan_pricing,
                start_date=start_date,
                end_date=end_date,
                status=SubscriptionStatus.TRIALING,
                stripe_subscription_id=subscription_id,
                auto_renew=True,
            )

        elif status == "active":
            # Paid subscription is active
            subscribe(
                student,
                plan_pricing.plan,
                plan_pricing=plan_pricing,
                start_date=start_date,
                end_date=end_date,
                status=SubscriptionStatus.ACTIVE,
                stripe_subscription_id=subscription_id,
                auto_renew=True,
            )

    def handle_subscription_updated(self, data):
        subscription_id = data["id"]
        customer_id = data["customer"]
        price_id = data["metadata"]["price_id"]
        status = data["status"]
        current_period_start = data["items"]["data"][0]["current_period_start"]
        current_period_end = data["items"]["data"][0]["current_period_end"]
        start_date = timezone.datetime.fromtimestamp(
            current_period_start, tz=timezone.utc
        )
        end_date = timezone.datetime.fromtimestamp(current_period_end, tz=timezone.utc)

        plan_pricing = PlanPricing.objects.get(stripe_price_id=price_id)

        student = Student.objects.get(stripe_customer_id=customer_id)

        print(status)

        if status == "active":
            # Paid subscription is active
            subscribe(
                student,
                plan_pricing.plan,
                plan_pricing=plan_pricing,
                start_date=start_date,
                end_date=end_date,
                status=SubscriptionStatus.ACTIVE,
                stripe_subscription_id=subscription_id,
                auto_renew=True,
            )

        elif status == "past_due":
            # Payment failed, subscription still exists
            subscribe(
                student,
                plan_pricing.plan,
                plan_pricing=plan_pricing,
                start_date=start_date,
                end_date=end_date,
                status=SubscriptionStatus.PAST_DUE,
                stripe_subscription_id=subscription_id,
                auto_renew=False,
            )

        elif status == "canceled":
            # Immediate cancellation
            subscribe(
                student,
                plan_pricing.plan,
                plan_pricing=plan_pricing,
                start_date=start_date,
                end_date=end_date,
                status=SubscriptionStatus.CANCELED,
                stripe_subscription_id=subscription_id,
                auto_renew=False,
            )
            subscribe_free_plan(student)

        elif status == "incomplete_expired":
            # Subscription never completed
            subscribe(
                student,
                plan_pricing.plan,
                plan_pricing=plan_pricing,
                start_date=start_date,
                end_date=end_date,
                status=SubscriptionStatus.INCOMPLETE_EXPIRED,
                stripe_subscription_id=subscription_id,
                auto_renew=False,
            )
            subscribe_free_plan(student)

        elif status == "unpaid":
            # Stripe marks subscription as unpaid after grace period
            subscribe(
                student,
                plan_pricing.plan,
                plan_pricing=plan_pricing,
                start_date=start_date,
                end_date=end_date,
                status=SubscriptionStatus.UNPAID,
                stripe_subscription_id=subscription_id,
            )
            subscribe_free_plan(student)

        elif status == "cancel_at_period_end":
            # User requested cancel at period end
            subscribe(
                student,
                plan_pricing.plan,
                plan_pricing=plan_pricing,
                start_date=start_date,
                end_date=end_date,
                status=student.current_subscription.status,
                stripe_subscription_id=subscription_id,
                auto_renew=False,
            )

    def handle_invoice_payment_succeeded(self, data):
        language = (
            data.get("parent", {})
            .get("subscription_details", {})
            .get("metadata", {})
            .get("language")
            or Language.PL
        )
        website_url = (
            data.get("parent", {})
            .get("subscription_details", {})
            .get("metadata", {})
            .get("website_url")
            or Language.PL
        )
        invoice_customer = InvoiceCustomer.objects.create(
            email=data["customer_email"],
            full_name=data["customer_name"],
            street_address=", ".join(
                filter(
                    None,
                    [
                        data["customer_address"]["line1"],
                        data["customer_address"]["line2"],
                    ],
                )
            ),
            city=", ".join(
                filter(
                    None,
                    [
                        data["customer_address"]["city"],
                        data["customer_address"]["state"],
                    ],
                )
            ),
            zip_code=data["customer_address"]["postal_code"],
            country=data["customer_address"]["country"],
        )
        invoice_items = [
            InvoiceItem.objects.create(
                item_id=PlanPricing.objects.get(
                    stripe_price_id=item["metadata"]["price_id"]
                ).plan.pk,
                name=item["description"],
                price=item["amount"],
                quantity=item["quantity"],
            )
            for item in data["lines"]["data"]
        ]
        invoice = Invoice.objects.create(
            customer=invoice_customer,
            items=invoice_items,
            currency=data["currency"],
            status=PaymentStatus.PAID,
            method=PaymentMethod.STRIPE,
        )

        invoice_generator = InvoiceGenerator(invoice, language, website_url)
        invoice_path = invoice_generator.create()

        mailer = Mailer(website_url)
        # mail_data = {
        #         **{
        #             "title": "Płatność utworzona",
        #             "description": "W załączniku dołączono fakturę.",
        #             "items": items,
        #             "amount": f"{amount:,.2f} {currency}",
        #             "status": "Utworzona",
        #             "method": method,
        #         }
        #     }

        #     mailer.send(
        #     email_template="purchase_confirmation.html",
        #     to=[invoice_customer.email],
        #     subject="Podsumowanie zakupu",
        #     data=mail_data,
        #     attachments=[invoice_path],
        # )
        invoice_generator.remove()

        print("Payment succeeded for actual invoice")

    def handle_invoice_payment_failed(self, data):
        print("Payment failed")
