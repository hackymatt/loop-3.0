from rest_framework import serializers
from django.contrib.auth import get_user_model
from global_config import CONFIG


class PersonalDataSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = [
            "email",
            "first_name",
            "last_name",
            "image",
            "street_address",
            "city",
            "zip_code",
            "country",
        ]

    def get_image(self, obj):
        request = self.context.get("request")
        return (
            f"http://localhost:8000{obj.image.url}"
            if CONFIG["is_local"]
            else request.build_absolute_uri(obj.image.url)
            if obj.image and hasattr(obj.image, "url") and request
            else None
        )
