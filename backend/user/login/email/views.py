from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
from ..serializers import LoginResponseSerializer
from ...utils import set_cookies


class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]

            # Create JWT token for the user
            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token

            response = Response(
                LoginResponseSerializer(user, context={"request": request}).data,
                status=status.HTTP_200_OK,
            )

            return set_cookies(response, access_token, refresh_token)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
