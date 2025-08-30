from rest_framework.generics import UpdateAPIView
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from django.utils.translation import gettext as _
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    UpdateUserSerializer,
    ChangePasswordSerializer,
    SubscriptionSerializer,
    InvoiceSerializer,
)
from const import JoinType
from plan.subscription.utils import get_subscription
from invoice.models import StudentInvoice
from global_config import CONFIG
from plan.payment.utils import generate_customer_portal_link
from utils.url.url import get_website_url
from user.type.student_user.models import Student


class UpdateUserView(UpdateAPIView):
    serializer_class = UpdateUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


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
