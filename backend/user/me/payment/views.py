import stripe
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from django.utils.translation import gettext as _
from .serializers import PaymentMethodSerializer
from user.type.student_user.models import Student
from utils.stripe.customer import (
    retrieve_customer,
    update_customer,
    get_payment_methods,
)
from utils.stripe.payment_method import retrieve_payment_method, detach_payment_method
from utils.stripe.setup_intent import retrieve_setup_intent


class PaymentMethodsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        stripe_customer_id = Student.objects.get(user=user).stripe_customer_id

        try:
            if stripe_customer_id:
                default_payment_method = (
                    retrieve_customer(stripe_customer_id)
                    .get("invoice_settings", {})
                    .get("default_payment_method")
                )
                payment_methods = get_payment_methods(stripe_customer_id)
                serializer = PaymentMethodSerializer(
                    payment_methods["data"],
                    many=True,
                    context={"default_payment_method": default_payment_method},
                )
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(
                [],
                status=status.HTTP_200_OK,
            )
        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        user = request.user

        payment_method_id = request.data.get("payment_method_id")

        stripe_customer_id = Student.objects.get(user=user).stripe_customer_id
        try:
            payment_method = retrieve_payment_method(payment_method_id)
            if payment_method.customer != stripe_customer_id:
                return Response(
                    {"error": _("This payment method does not belong to your account.")},
                    status=status.HTTP_403_FORBIDDEN,
                )

            update_customer(
                stripe_customer_id,
                invoice_settings={"default_payment_method": payment_method_id},
            )
            return Response({}, status=status.HTTP_200_OK)
        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, payment_method_id, *args, **kwargs):
        user = request.user
        stripe_customer_id = Student.objects.get(user=user).stripe_customer_id
        try:
            payment_method = retrieve_payment_method(payment_method_id)
            if payment_method.customer != stripe_customer_id:
                return Response(
                    {"error": _("This payment method does not belong to your account.")},
                    status=status.HTTP_403_FORBIDDEN,
                )

            default_payment_method = retrieve_customer(
                stripe_customer_id
            ).invoice_settings.get("default_payment_method")
            if payment_method_id == default_payment_method:
                return Response(
                    {"error": _("Cannot delete the default payment method.")},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            detach_payment_method(payment_method_id)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
