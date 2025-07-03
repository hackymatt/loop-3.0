from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from ..utils import check_password


class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["first_name", "last_name", "image"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        error, error_message = check_password(value)
        if error:
            raise serializers.ValidationError([_(error_message)])

        return value
