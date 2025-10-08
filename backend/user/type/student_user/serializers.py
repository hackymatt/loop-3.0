from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Student
from global_config import CONFIG


class StudentSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["first_name", "image"]

    def get_image(self, obj):
        request = self.context.get("request")
        return (
            f"http://localhost:8000{obj.user.image.url}"
            if CONFIG["is_local"]
            else request.build_absolute_uri(obj.user.image.url)
            if obj.user.image and hasattr(obj.user.image, "url") and request
            else None
        )
