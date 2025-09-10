import stripe
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.utils.translation import gettext as _
from user.type.student_user.models import Student
from plan.models import Plan, PlanPricing
from invoice.models import Invoice, InvoiceCustomer, InvoiceItem, StudentInvoice
from invoice.utils import (
    generate_and_send_invoice,
    send_payment_failed_email,
    send_cancel_email,
)
from plan.subscription.utils import subscribe, subscribe_free_plan
from const import (
    SubscriptionStatus,
    PaymentStatus,
    PaymentMethod,
    Language,
    PaymentType,
)
from utils.logger.logger import logger
from .models import (
    PaymentMethod,
    CardPaymentMethod,
    PayPalPaymentMethod,
    RevolutPaymentMethod,
)
from utils.url.url import get_website_url
from utils.stripe.customer import (
    create_customer,
    create_customer_session,
    update_customer,
)
from utils.stripe.setup_intent import create_setup_intent
from utils.stripe.payment_method import modify_payment_method, retrieve_payment_method
from utils.stripe.subscription import create_subscription
from utils.stripe.webhook import construct_event
from global_config import CONFIG


class CreateSetupIntentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            student = Student.objects.get(user=request.user)
            if not student.stripe_customer_id:
                customer = create_customer(email=student.user.email)
                student.stripe_customer_id = customer.id
                student.save()
            else:
                customer = {"id": student.stripe_customer_id}

            setup_intent = create_setup_intent(
                customer_id=customer["id"],
            )
            customer_session = create_customer_session(
                customer_id=customer["id"],
                components={
                    "payment_element": {
                        "enabled": True,
                        "features": {
                            "payment_method_redisplay": "enabled",
                        },
                    },
                },
            )

            return Response(
                {
                    "client_secret": setup_intent.client_secret,
                    "customer_session_client_secret": customer_session.client_secret,
                },
                status=status.HTTP_200_OK,
            )

        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CreateSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            website_url = get_website_url(request)
            language = request.LANGUAGE_CODE

            type = request.data.get("plan")
            interval = request.data.get("interval")
            currency = request.data.get("currency")

            plan = Plan.objects.get(type=type)
            pricing = PlanPricing.get_current_price(plan, currency, interval)

            student = Student.objects.get(user=request.user)
            if not student.stripe_customer_id:
                customer = create_customer(email=student.user.email)
                student.stripe_customer_id = customer.id
                student.save()

            trial_days = 0 if student.trial_used else CONFIG["free_trial_days"]

            subscription = create_subscription(
                customer_id=student.stripe_customer_id,
                items=[{"price": pricing.stripe_price_id}],
                metadata={"website_url": website_url, "language": language},
                payment_behavior="default_incomplete",
                expand=["latest_invoice.payment_intent"],
                trial_period_days=trial_days,
            )

            payment_intent = getattr(
                subscription.latest_invoice, "payment_intent", None
            )
            if subscription.status == SubscriptionStatus.TRIALING:
                status_flag = "succeeded"
            elif payment_intent and payment_intent.status == "succeeded":
                status_flag = "succeeded"
            else:
                status_flag = "failed"

            return Response({"status": status_flag}, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        try:
            event = construct_event(payload, sig_header)
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

    def handle_subscription_created(self, data):
        subscription_id = data["id"]
        customer_id = data["customer"]
        price_id = data["items"]["data"][0]["price"]["id"]
        status = data["status"]
        current_period_start = data["items"]["data"][0]["current_period_start"]
        current_period_end = data["items"]["data"][0]["current_period_end"]
        start_date = timezone.datetime.fromtimestamp(
            current_period_start, tz=timezone.utc
        )
        end_date = timezone.datetime.fromtimestamp(current_period_end, tz=timezone.utc)

        plan_pricing = PlanPricing.objects.get(stripe_price_id=price_id)

        student = Student.objects.get(stripe_customer_id=customer_id)

        student.trial_used = True
        student.save()

        subscribe(
            student,
            plan_pricing.plan,
            plan_pricing=plan_pricing,
            start_date=start_date,
            end_date=end_date,
            status=status,
            stripe_subscription_id=subscription_id,
            cancel_at_period_end=False,
        )

    def handle_subscription_updated(self, data):
        subscription_id = data["id"]
        customer_id = data["customer"]
        price_id = data["items"]["data"][0]["price"]["id"]
        status = data["status"]
        cancel_at_period_end = data.get("cancel_at_period_end", False)
        current_period_start = data["items"]["data"][0]["current_period_start"]
        current_period_end = data["items"]["data"][0]["current_period_end"]
        start_date = timezone.datetime.fromtimestamp(
            current_period_start, tz=timezone.utc
        )
        end_date = timezone.datetime.fromtimestamp(current_period_end, tz=timezone.utc)
        website_url = data["items"]["data"][0]["metadata"]["website_url"]
        language = data["items"]["data"][0]["metadata"]["language"]

        plan_pricing = PlanPricing.objects.get(stripe_price_id=price_id)
        student = Student.objects.get(stripe_customer_id=customer_id)

        if status in [
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAST_DUE,
        ]:
            subscribe(
                student,
                plan_pricing.plan,
                plan_pricing=plan_pricing,
                start_date=start_date,
                end_date=end_date,
                status=status,
                stripe_subscription_id=subscription_id,
                cancel_at_period_end=False
                if status == SubscriptionStatus.PAST_DUE
                else cancel_at_period_end,
            )

        elif status in [
            SubscriptionStatus.UNPAID,
            SubscriptionStatus.CANCELED,
            SubscriptionStatus.INCOMPLETE_EXPIRED,
        ]:
            subscribe_free_plan(student, start_date=end_date)
            send_cancel_email(student, student.user.email, website_url, language)

    def handle_invoice_payment_succeeded(self, data):
        generate_invoice = (data.get("amount_due") or 0) > 0

        if not generate_invoice:
            logger.info("Invoice generation has been skipped")
            return

        price_id = data["items"]["data"][0]["price"]["id"]
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
            or CONFIG["website_url"]
        )
        student = Student.objects.get(stripe_customer_id=data["customer"])

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
                item_id=PlanPricing.objects.get(stripe_price_id=price_id).plan.pk,
                name=item["description"],
                price=item["amount"],
                quantity=item["quantity"],
            )
            for item in data["lines"]["data"]
        ]
        invoice = Invoice.objects.create(
            customer=invoice_customer,
            currency=data["currency"],
            status=PaymentStatus.PAID,
            method=PaymentMethod.STRIPE,
            language=language,
        )
        invoice.items.set(invoice_items)
        invoice.save()

        generate_and_send_invoice(invoice, website_url, student.user.first_name)

        StudentInvoice.objects.create(invoice=invoice, student=student)

    def handle_invoice_payment_failed(self, data):
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
            or CONFIG["website_url"]
        )

        student = Student.objects.get(stripe_customer_id=data["customer"])
        send_payment_failed_email(student, data["customer"], website_url, language)

    def handle_setup_intent_succeeded(self, data):
        customer_id = data["customer"]
        payment_method_id = data["payment_method"]
        payment_method = retrieve_payment_method(payment_method_id)

        student = Student.objects.get(stripe_customer_id=customer_id)
        type = payment_method["type"]
        PaymentMethod.objects.filter(student=student).update(is_default=False)
        obj = PaymentMethod.objects.create(
            student=student,
            stripe_payment_method_id=payment_method_id,
            is_default=True,
            type=type,
        )

        if type == PaymentType.CARD:
            CardPaymentMethod.objects.create(
                payment_method=obj,
                brand=payment_method["card"]["brand"],
                display_brand=payment_method["card"]["display_brand"],
                last4=payment_method["card"]["last4"],
                exp_month=payment_method["card"]["exp_month"],
                exp_year=payment_method["card"]["exp_year"],
                holder=payment_method["billing_details"]["name"],
                wallet=payment_method["card"]["wallet"]["type"]
                if payment_method["card"]["wallet"]
                else None,
            )

        elif type == PaymentType.PAYPAL:
            PayPalPaymentMethod.objects.create(
                payment_method=obj, payer_email=payment_method["paypal"]["payer_email"]
            )
        elif type == PaymentType.REVOLUT:
            RevolutPaymentMethod.objects.create(payment_method=obj)
        else:
            logger.error(
                f"Could not save payment method of type: {type}. Payload: {payment_method}"
            )

        update_customer(
            customer_id,
            invoice_settings={"default_payment_method": payment_method_id},
        )
        try:
            modify_payment_method(payment_method_id, allow_redisplay="always")
        except stripe.error.InvalidRequestError as e:
            logger.info(f"Skipping modify_payment_method for unsupported type: {e}")
