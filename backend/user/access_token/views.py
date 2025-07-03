from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
import datetime


class AccessTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        token = AccessToken()

        token.set_exp(
            from_time=datetime.datetime.now(datetime.timezone.utc),
            lifetime=datetime.timedelta(minutes=5),
        )

        token["user_id"] = str(user.id)

        return Response({"token": str(token)}, status=status.HTTP_200_OK)
