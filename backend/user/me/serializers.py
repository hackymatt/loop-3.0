from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from ..utils import check_password
from plan.subscription.models import PlanSubscription
from plan.models import PlanPricing


class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["first_name", "last_name", "image"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        error, error_message = check_password(value)
        if error:
            raise serializers.ValidationError([_(error_message)])

        return value


class SubscriptionSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="plan.slug")
    license = serializers.SerializerMethodField()
    interval = serializers.CharField(source="plan.plan_pricing.interval")
    valid_to = serializers.DateTimeField(source="end_date")
    price = serializers.CharField(source="plan.plan_pricing.price")
    currency = serializers.CharField(source="plan.plan_pricing.currency")

    class Meta:
        model = PlanSubscription
        fields = ["type", "license", "interval", "valid_to", "price", "currency"]

    def get_license(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.plan.get_translation(lang).license
