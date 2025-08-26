import stripe
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from user.type.student_user.models import Student
from plan.models import Plan, PlanPricing
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


class CreateSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            student = Student.objects.get(user=request.user)

            if not student.stripe_customer_id:
                customer = stripe.Customer.create(email=student.user.email)
                student.stripe_customer_id = customer.id
                student.save()
            else:
                customer = {"id": student.stripe_customer_id}

            plan_type = request.data.get("type")
            interval = request.data.get("interval")
            currency = request.data.get("currency")

            plan = get_object_or_404(Plan, type=plan_type)

            pricing = PlanPricing.get_current_price(plan=plan, currency=currency, interval=interval)

            print(pricing.stripe_price_id)

            subscription = stripe.Subscription.create(
                customer=customer["id"],
                items=[{"price": pricing.stripe_price_id}],
                trial_period_days=7,
                payment_behavior="default_incomplete",
                expand=["latest_invoice.payment_intent"],
            )

            payment_intent = getattr(subscription.latest_invoice, "payment_intent", None)

            if not payment_intent:
                setup_intent = stripe.SetupIntent.create(
                    customer=customer["id"]
                )
                client_secret = setup_intent.client_secret
                intent_type = "setup"
            else:
                client_secret = payment_intent.client_secret
                intent_type = "payment"

            return Response({
                "subscription_id": subscription.id,
                "client_secret": client_secret,
                "intent_type": intent_type
            })

        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
