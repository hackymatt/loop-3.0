from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from ..utils import set_cookies, clear_cookies


class RefreshTokenView(APIView):
    def post(self, request):
        old_refresh_token = request.COOKIES.get("refresh_token")

        try:
            # Try to decode and verify the refresh token
            old_token = RefreshToken(old_refresh_token)

            # Extract user_id from token and get user object
            user_id = old_token.get("user_id")
            user = get_user_model().objects.get(id=user_id)

            # Create new access and refresh tokens
            new_token = RefreshToken.for_user(user)
            new_access_token = str(new_token.access_token)
            new_refresh_token = str(new_token)

            # Issue a new access token
            new_access_token = str(old_token.access_token)

            response = Response({}, status=status.HTTP_200_OK)
            return set_cookies(response, new_access_token, new_refresh_token)

        except Exception as e:
            response = Response(
                {"root": [_("Refresh token is required")]},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            return clear_cookies(response)
