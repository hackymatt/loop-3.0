from django.contrib.auth import get_user_model
from rest_framework import serializers
from plan.models import Plan
from plan.subscription.utils import get_subscription
from const import UserType


class PlanSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="slug")
    license = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = ["type", "license"]

    def get_license(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).license


class LoginResponseSerializer(serializers.ModelSerializer):
    plan = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

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
            "plan",
        ]

    def get_plan(self, obj):
        if obj.user_type != UserType.STUDENT:
            return None

        subscription = get_subscription(obj)
        return PlanSerializer(
            subscription.plan, context={"request": self.context.get("request")}
        ).data

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url") and request:
            return request.build_absolute_uri(obj.image.url)
        return None
