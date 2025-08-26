import stripe
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from user.type.student_user.models import Student
from plan.models import Plan, PlanPricing
from plan.subscription.models import PlanSubscription
from plan.subscription.utils import subscribe, subscribe_free_plan
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


class CreateSetupIntentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            student = Student.objects.get(user=request.user)

            plan_type = request.data.get("type")
            interval = request.data.get("interval")
            currency = request.data.get("currency")

            plan = get_object_or_404(Plan, type=plan_type)

            pricing = PlanPricing.get_current_price(plan=plan, currency=currency, interval=interval)

            if not student.stripe_customer_id:
                customer = stripe.Customer.create(email=student.user.email)
                student.stripe_customer_id = customer.id
                student.save()
            else:
                customer = {"id": student.stripe_customer_id}

            setup_intent = stripe.SetupIntent.create(
                customer=customer["id"],
                metadata={"price_id": pricing.stripe_price_id} 
            )
            client_secret = setup_intent.client_secret

            return Response({
                "client_secret": client_secret,
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StripeWebhookView(APIView):
    authentication_classes = []  # Webhook nie wymaga autoryzacji
    permission_classes = []      # ani uprawnień

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = CONFIG["stripe_webhook_secret"]

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        data = event['data']['object']
        event_type = event['type']

        if event_type == 'customer.subscription.updated':
            self.handle_subscription_updated(data)
        elif event_type == 'invoice.payment_succeeded':
            self.handle_invoice_payment_succeeded(data)
        elif event_type == 'invoice.payment_failed':
            self.handle_invoice_payment_failed(data)
        elif event_type == 'setup_intent.succeeded':
            self.handle_setup_intent_succeeded(data)

        return Response(status=status.HTTP_200_OK)

    def handle_setup_intent_succeeded(self, data):
        customer_id = data['customer']
        price_id=data["metadata"]["price_id"]
        plan_pricing = PlanPricing.objects.get(stripe_price_id=price_id)

        student = Student.objects.get(stripe_customer_id=customer_id)

        subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{"price": price_id}],
                trial_period_days=7,
                payment_behavior="default_incomplete",
                expand=["latest_invoice.payment_intent"],
            )

        trial_end = subscription.get('trial_end')
        end_date = timezone.datetime.fromtimestamp(trial_end, tz=timezone.utc)

        subscribe(student, plan_pricing, end_date, subscription["id"])

    def handle_subscription_updated(self, data):
        customer_id = data['customer']
        subscription_id = data["id"]
        status = data["status"]

        student = Student.objects.get(stripe_customer_id=customer_id)

        subscription = PlanSubscription.objects.get(stripe_subscription_id=subscription_id)
        if status == "active":
            subscribe(student, subscription.plan_pricing, None, subscription["id"])
        elif status in ["canceled", "incomplete_expired"]:
            subscribe_free_plan(student)

    def handle_invoice_payment_succeeded(self, data):
        print("Payment succeeded for actual invoice")

    def handle_invoice_payment_failed(self, data):
        print("Payment failed")