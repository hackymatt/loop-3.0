import jwt
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import PasswordResetSerializer, PasswordResetConfirmSerializer
from ..utils import send_reset_password_email
from global_config import CONFIG


class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data["email"]
            user = get_user_model().objects.get(email=email)

            # Send the password reset email
            send_reset_password_email(request, user)

            return Response({"email": user.email}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)

        if serializer.is_valid():
            try:
                token = request.data.get("token", "")

                decoded_token = jwt.decode(
                    token, CONFIG["secret"], algorithms=["HS256"]
                )
                user_id = decoded_token.get("user_id")

                user = get_user_model().objects.get(pk=user_id)

                user.set_password(serializer.validated_data["password"])
                user.save()

                return Response({"email": user.email}, status=status.HTTP_200_OK)

            except jwt.ExpiredSignatureError:
                return Response(
                    {"root": _("Invalid reset password link")},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except jwt.InvalidTokenError:
                return Response(
                    {"root": _("Invalid token")}, status=status.HTTP_400_BAD_REQUEST
                )
            except get_user_model().DoesNotExist:
                return Response(
                    {"root": _("User not found")}, status=status.HTTP_404_NOT_FOUND
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
