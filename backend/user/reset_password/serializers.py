from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from ..utils import check_password


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not get_user_model().objects.filter(email=value).exists():
            raise serializers.ValidationError(
                [_("Account with this email address does not exist.")]
            )
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField()

    def validate_password(self, value):
        """
        Validate the password to ensure it meets the required criteria
        """
        error, error_message = check_password(value)
        if error:
            raise serializers.ValidationError([_(error_message)])

        return value
