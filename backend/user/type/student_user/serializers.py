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
        if obj.user.image and hasattr(obj.user.image, "url") and request:
            if CONFIG["is_local"]:
                return f"http://localhost:8000{obj.user.image.url}"
            return request.build_absolute_uri(obj.user.image.url)
        return None
