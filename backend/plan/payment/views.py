import stripe
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from user.type.student_user.models import Student
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

            stripe_price_id = request.data.get("id")

            subscription = stripe.Subscription.create(
                customer=customer["id"],
                items=[{"price": stripe_price_id}],
                trial_period_days=CONFIG["free_trial_days"],
                payment_behavior="default_incomplete",
                expand=["latest_invoice.payment_intent"],
            )

            client_secret = subscription.latest_invoice.payment_intent.client_secret

            return Response(
                {"subscription_id": subscription.id, "client_secret": client_secret},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
