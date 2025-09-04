import stripe
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from .serializers import SubscriptionSerializer
from plan.models import Plan, PlanPricing
from plan.subscription.utils import get_subscription
from user.type.student_user.models import Student
from utils.stripe.subscription import modify_subscription

class SubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        subscription = get_subscription(user)

        return Response(
            SubscriptionSerializer(subscription, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class CancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        student = Student.objects.get(user=user)
        subscription_id = student.current_subscription.stripe_subscription_id

        try:
            modify_subscription(subscription_id, cancel_at_period_end=True)
            return Response({}, status=status.HTTP_200_OK)
        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RenewSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        student = Student.objects.get(user=user)
        subscription_id = student.current_subscription.stripe_subscription_id

        try:
            modify_subscription(subscription_id, cancel_at_period_end=False)
            return Response({}, status=status.HTTP_200_OK)
        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ChangeSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        student = Student.objects.get(user=user)
        subscription_id = student.current_subscription.stripe_subscription_id

        plan = request.data.get("plan")
        interval = request.data.get("interval")
        currency = request.data.get("currency")

        plan = Plan.objects.get(type=plan)
        pricing = PlanPricing.get_current_price(plan, currency, interval)

        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            current_item_id = subscription["items"]["data"][0].id

            stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=False,
                items=[{
                    "id": current_item_id,
                    "price": pricing.stripe_price_id,
                }],
                proration_behavior="create_prorations"
            )
            return Response({}, status=status.HTTP_200_OK)
        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)