from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from ..utils import check_password
from plan.subscription.models import PlanSubscription


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
    type = serializers.CharField(source="plan.type")
    license = serializers.SerializerMethodField()
    next_billing_date = serializers.DateTimeField(source="end_date")
    interval = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()

    class Meta:
        model = PlanSubscription
        fields = [
            "type",
            "license",
            "interval",
            "next_billing_date",
            "price",
            "currency",
            "status",
            "auto_renew",
        ]

    def get_license(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.plan.get_translation(lang).license

    def get_interval(self, obj):
        return obj.plan_pricing.interval if obj.plan_pricing else None

    def get_price(self, obj):
        return obj.plan_pricing.price if obj.plan_pricing else None

    def get_currency(self, obj):
        return obj.plan_pricing.currency if obj.plan_pricing else None
