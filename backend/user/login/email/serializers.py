from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import gettext as _
from rest_framework import serializers, exceptions


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = get_user_model().objects.filter(email=email).first()

        if user and not user.is_active:
            raise exceptions.AuthenticationFailed({"root": [_("Inactive user")]})

        user = authenticate(email=email, password=password)

        if user is None:
            raise serializers.ValidationError(
                {"root": [_("Incorrect email or password")]}
            )

        return {"user": user}
