from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from .serializers import SubscriptionSerializer
from plan.subscription.utils import get_subscription


class SubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        subscription = get_subscription(user)

        return Response(
            SubscriptionSerializer(subscription, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )
