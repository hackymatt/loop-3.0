from django.contrib.auth import get_user_model
from rest_framework import serializers
from plan.subscription.models import PlanSubscription
from plan.subscription.utils import get_subscription
from user.type.student_user.models import Student
from const import UserType
from global_config import CONFIG


class PlanSubscriptionSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="plan.type")
    currency = serializers.CharField(source="plan_pricing.currency", default=None)
    interval = serializers.CharField(source="plan_pricing.interval", default=None)

    class Meta:
        model = PlanSubscription
        fields = ["type", "currency", "interval"]


class LoginResponseSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    plan = serializers.SerializerMethodField()
    trial_used = serializers.SerializerMethodField()
    first_purchase = serializers.SerializerMethodField()

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
            "trial_used",
            "first_purchase",
            "plan",
        ]

    def get_plan(self, obj):
        if obj.user_type != UserType.STUDENT:
            return None

        subscription = get_subscription(obj)
        return PlanSubscriptionSerializer(subscription).data

    def get_trial_used(self, obj):
        if obj.user_type != UserType.STUDENT:
            return None

        student = Student.objects.get(user=obj)
        return student.trial_used

    def get_first_purchase(self, obj):
        if obj.user_type != UserType.STUDENT:
            return None

        student = Student.objects.get(user=obj)
        return student.first_purchase

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url") and request:
            if CONFIG["is_local"]:
                return f"http://localhost:8000{obj.image.url}"
            return request.build_absolute_uri(obj.image.url)
        return None
