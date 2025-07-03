from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .serializers import EmailOnlyUserSerializer
from ..utils import send_activation_email


class RegisterView(APIView):
    """
    Custom register view for email and password registration.
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Use the simplified serializer that requires only email and password
        serializer = EmailOnlyUserSerializer(data=request.data)

        email = request.data.get("email")
        serializer.validate_email(value=email)

        if serializer.is_valid():
            # Save the user data after validation
            user = serializer.save()

            # Send the confirmation email with the activation link
            send_activation_email(request, user)

            return Response(
                {"email": user.email},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
