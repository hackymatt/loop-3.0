from rest_framework import serializers
from ..login.serializers import LoginResponseSerializer
from plan.subscription.utils import get_subscription
from const import UserType

class DashboardUserSerializer(LoginResponseSerializer):
    plan_license = serializers.SerializerMethodField()

    class Meta(LoginResponseSerializer.Meta):
        fields = LoginResponseSerializer.Meta.fields + ["plan_license"]

    def get_plan_license(self, obj):
        if obj.user_type != UserType.STUDENT:
            return None

        subscription = get_subscription(obj)
        lang = self.context.get("request").LANGUAGE_CODE
        translation = subscription.plan_pricing.plan.get_translation(lang)
        return translation.license if translation else None