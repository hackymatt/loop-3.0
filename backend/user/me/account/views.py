from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from django.utils.translation import gettext as _
from rest_framework_simplejwt.tokens import RefreshToken


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
