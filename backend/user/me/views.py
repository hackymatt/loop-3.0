from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from django.utils.translation import gettext as _
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    PersonalDataSerializer,
    ChangePasswordSerializer,
    SubscriptionSerializer,
    PaymentMethodSerializer,
    InvoiceSerializer,
)
from const import JoinType
from plan.subscription.utils import get_subscription
from invoice.models import StudentInvoice
from plan.payment.utils import generate_customer_portal_link
from utils.url.url import get_website_url
from user.type.student_user.models import Student
from utils.stripe.customer import (
    retrieve_customer,
    update_customer,
    get_payment_methods,
)
from utils.stripe.payment_method import retrieve_payment_method, detach_payment_method


class PersonalDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = PersonalDataSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = PersonalDataSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        stripe_customer_id = Student.objects.get(user=user).stripe_customer_id
        if stripe_customer_id:
            update_customer(
                stripe_customer_id,
                name=f"{serializer.data['first_name']} {serializer.data['last_name']}",
                address={
                    "line1": serializer.data.get("street_address", ""),
                    "postal_code": serializer.data.get("zip_code", ""),
                    "city": serializer.data.get("city", ""),
                    "country": serializer.data.get("country", ""),
                },
            )
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # Only allow password change if user registered using email
        if user.join_type != JoinType.EMAIL:
            return Response(
                {
                    "root": _(
                        "Password change is only available for accounts created with an email address."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"old_password": _("Incorrect password.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response({}, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    permission_classes = [
        IsAuthenticated
    ]  # Only authenticated users can delete their account

    def delete(self, request, *args, **kwargs):
        user = request.user

        refresh_token = request.COOKIES.get("refresh_token")

        # Blacklist the refresh token
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as e:
            return Response(
                {"root": [_("Refresh token is required")]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()

        response = Response({}, status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        return response


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user = request.user

        refresh_token = request.COOKIES.get("refresh_token")

        # Blacklist the refresh token
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as e:
            return Response(
                {"root": [_("Refresh token is required")]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()

        response = Response({}, status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        return response


class SubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        subscription = get_subscription(user)

        return Response(
            SubscriptionSerializer(subscription, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class PaymentMethodsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        stripe_customer_id = Student.objects.get(user=user).stripe_customer_id
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

    def post(self, request, *args, **kwargs):
        user = request.user
        payment_method_id = request.data.get("payment_method_id")
        stripe_customer_id = Student.objects.get(user=user).stripe_customer_id
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

    def delete(self, request, payment_method_id, *args, **kwargs):
        user = request.user
        stripe_customer_id = Student.objects.get(user=user).stripe_customer_id

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


class InvoicesView(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            StudentInvoice.objects.filter(student__user=user)
            .select_related("invoice")
            .order_by("-invoice__invoice_date")
        )


class CustomerPortalLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        student = Student.objects.get(user=request.user)
        website_url = get_website_url(request)
        url = generate_customer_portal_link(student, website_url)
        return Response({"url": url}, status=status.HTTP_200_OK)
