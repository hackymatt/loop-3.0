from django.contrib.auth import get_user_model
from rest_framework import serializers
from plan.subscription.utils import get_subscription
from const import UserType


class LoginResponseSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    plan_type = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = [
            "email",
            "first_name",
            "last_name",
            "image",
            "user_type",
            "is_active",
            "join_type",
            "plan_type",
        ]

    def get_plan_type(self, obj):
        if obj.user_type != UserType.STUDENT:
            return None

        subscription = get_subscription(obj)
        return subscription.plan_pricing.plan.type

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url") and request:
            return request.build_absolute_uri(obj.image.url)
        return None
