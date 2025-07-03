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
    user = UserSerializer(required=True)


class UserSubscription(serializers.ModelSerializer):
    type = serializers.CharField(source="plan.slug")
    interval = serializers.SerializerMethodField()
    valid_to = serializers.DateTimeField(source="end_date")

    class Meta:
        model = PlanSubscription
        fields = ["type", "interval", "valid_to"]

    def get_interval(self, obj):
        if not obj.end_date:
            return None
        delta_days = (obj.end_date - obj.start_date).days
        return "yearly" if delta_days > 31 else "monthly"
