from django.contrib.auth import get_user_model
from rest_framework import serializers
from plan.subscription.utils import get_subscription
from plan.subscription.serializers import UserSubscription
from const import UserType


class UserPlanSerializer(serializers.Serializer):
    type = serializers.CharField()
    interval = serializers.CharField(allow_null=True)
    valid_to = serializers.DateTimeField(allow_null=True)


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
        return UserSubscription(subscription).data

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url") and request:
            return request.build_absolute_uri(obj.image.url)
        return None
