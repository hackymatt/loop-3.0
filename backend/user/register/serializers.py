from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from rest_framework import serializers
from plan.subscription.utils import subscribe_free_plan
from user.type.student_user.models import Student
from ..utils import check_password, get_unique_username
from const import UserType


class EmailOnlyUserSerializer(serializers.ModelSerializer):
    """
    Custom user serializer for registration using only email and password.
    """

    class Meta:
        model = get_user_model()
        fields = ["email", "password"]  # Only email and password are needed
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def validate_email(self, value):
        """
        Check if the email is already registered.
        """
        if get_user_model().objects.filter(email=value).exists():
            raise serializers.ValidationError(
                {"email": [_("Account with this email address already exists.")]}
            )
        return value

    def validate_password(self, value):
        """
        Validate the password to ensure it meets the required criteria
        """
        error, error_message = check_password(value)
        if error:
            raise serializers.ValidationError([_(error_message)])

        return value

    def create(self, validated_data):
        # Get the email and extract the part before '@' to create the username
        email = validated_data["email"]
        username = email.split("@")[0]

        # Ensure the username is unique
        username = get_unique_username(username)

        user = get_user_model().objects.create_user(
            username=username,  # Use the unique username
            email=email,
            password=validated_data["password"],
            user_type=UserType.STUDENT,
        )

        student = Student.objects.create(user=user)
        subscribe_free_plan(student)

        return user
