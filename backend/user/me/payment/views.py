import stripe
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.utils.translation import gettext as _
from django.db import transaction
from .serializers import PaymentMethodSerializer
from user.type.student_user.models import Student
from plan.payment.models import PaymentMethod
from utils.stripe.customer import update_customer
from utils.stripe.payment_method import detach_payment_method


class PaymentMethodViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            PaymentMethod.objects.filter(student__user=user)
            .select_related("card", "paypal", "revolut")
            .order_by("-created_at")
        )

    def update(self, request, *args, **kwargs):
        user = request.user
        student = Student.objects.get(user=user)
        stripe_customer_id = student.stripe_customer_id

        payment_method = self.get_object()
        payment_method_id = payment_method.stripe_payment_method_id

        try:
            # Update Stripe
            update_customer(
                stripe_customer_id,
                invoice_settings={"default_payment_method": payment_method_id},
            )

            # Update DB
            with transaction.atomic():
                PaymentMethod.objects.filter(student=student).update(is_default=False)
                payment_method.is_default = True
                payment_method.save(update_fields=["is_default"])

            return Response(
                self.get_serializer(payment_method).data,
                status=status.HTTP_200_OK,
            )

        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        payment_method = self.get_object()
        payment_method_id = payment_method.stripe_payment_method_id

        if payment_method.is_default:
            return Response(
                {"error": _("Cannot delete the default payment method.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            detach_payment_method(payment_method_id)
            return super().destroy(request, *args, **kwargs)
        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
