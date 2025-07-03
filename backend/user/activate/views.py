import jwt
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from ..utils import send_activation_email
from global_config import CONFIG


class ActivateAccountView(APIView):
    """
    View for handling account activation when the user clicks the activation link.
    """

    def post(self, request, *args, **kwargs):
        try:
            token = request.data.get("token", "")

            decoded_token = jwt.decode(token, CONFIG["secret"], algorithms=["HS256"])
            user_id = decoded_token.get("user_id")

            user = get_user_model().objects.get(pk=user_id)

            if user.is_active:
                return Response({"email": user.email}, status=status.HTTP_200_OK)

            user.is_active = True
            user.save()

            return Response({"email": user.email}, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return Response(
                {"root": _("Invalid activation link")},
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


class ResendActivationLinkView(APIView):
    """
    View for handling reissue of activation link when the user requests.
    """

    def post(self, request, *args, **kwargs):
        token = request.data.get("token")
        email = request.data.get("email")

        if not token and not email:
            return Response(
                {"root": _("You must provide either a token or an email.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = None

        if token:
            try:
                decoded_token = jwt.decode(
                    token, CONFIG["secret"], algorithms=["HS256"]
                )
                user_id = decoded_token.get("user_id")
                user = get_user_model().objects.filter(pk=user_id).first()
            except jwt.DecodeError:
                return Response(
                    {"root": _("Invalid token.")}, status=status.HTTP_400_BAD_REQUEST
                )
        else:
            user = get_user_model().objects.filter(email=email).first()

        if not user:
            return Response(
                {"root": _("User not found.")}, status=status.HTTP_404_NOT_FOUND
            )

        if user.is_active:
            return Response({"email": user.email}, status=status.HTTP_200_OK)

        send_activation_email(request, user)

        return Response({"email": user.email}, status=status.HTTP_201_CREATED)
