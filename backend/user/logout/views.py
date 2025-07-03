from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.translation import gettext as _


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
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

        response = Response({}, status=status.HTTP_205_RESET_CONTENT)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        return response
