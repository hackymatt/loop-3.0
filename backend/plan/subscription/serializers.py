from rest_framework import serializers
from .models import PlanSubscription


class UserSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)


class SubscriptionSerializer(serializers.Serializer):
    plan = serializers.CharField(required=True)
    interval = serializers.ChoiceField(
        choices=["monthly", "yearly"], required=True, allow_null=True
    )
    currency = serializers.CharField(required=True)
    user = UserSerializer(required=True)


class UserSubscriptionSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="plan.type")
    license = serializers.SerializerMethodField()
    interval = serializers.CharField(source="plan_pricing.interval")
    valid_to = serializers.DateTimeField(source="end_date")
    price = serializers.CharField(source="plan_pricing.price")
    currency = serializers.CharField(source="plan_pricing.currency")

    class Meta:
        model = PlanSubscription
        fields = ["type", "license", "interval", "valid_to", "price", "currency"]

    def get_license(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.plan.get_translation(lang).license
