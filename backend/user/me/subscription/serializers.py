from rest_framework import serializers
from plan.subscription.models import PlanSubscription


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
            "amount_due",
            "currency",
            "status",
            "cancel_at_period_end",
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
