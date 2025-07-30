from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    image = serializers.ImageField(
        source="user.image", read_only=True
    )  # Get user image

    class Meta:
        model = Student
        fields = ["first_name", "image"]
