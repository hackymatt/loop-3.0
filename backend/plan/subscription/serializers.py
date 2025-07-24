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


class UserSubscription(serializers.ModelSerializer):
    type = serializers.CharField(source="plan.slug")
    license = serializers.SerializerMethodField()
    interval = serializers.SerializerMethodField()
    valid_to = serializers.DateTimeField(source="end_date")
    price = serializers.SerializerMethodField()

    class Meta:
        model = PlanSubscription
        fields = ["type", "license", "interval", "valid_to", "price", "currency"]

    def get_license(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.plan.get_translation(lang).license

    def get_interval(self, obj):
        if not obj.end_date:
            return None
        delta_days = (obj.end_date - obj.start_date).days
        return "yearly" if delta_days > 31 else "monthly"

    def get_price(self, obj):
        interval = self.get_interval(obj)
        lang = self.context.get("request").LANGUAGE_CODE
        translation = obj.plan.get_translation(lang)
        return (
            translation.yearly_price
            if interval == "yearly"
            else translation.monthly_price
        )
