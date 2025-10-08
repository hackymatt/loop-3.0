from rest_framework import serializers
from .models import Instructor
from global_config import CONFIG


class InstructorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()  # Get full name
    image = serializers.SerializerMethodField()

    class Meta:
        model = Instructor
        fields = ["full_name", "image", "role"]

    def get_full_name(self, obj):
        """Return the full name of the instructor."""
        return f"{obj.user.first_name} {obj.user.last_name}".strip()

    def get_image(self, obj):
        request = self.context.get("request")
        return (
            f"http://localhost:8000{obj.user.image.url}"
            if obj.user.image
            and hasattr(obj.user.image, "url")
            and request
            and CONFIG["is_local"]
            else request.build_absolute_uri(obj.user.image.url)
            if obj.user.image and hasattr(obj.user.image, "url") and request
            else None
        )
