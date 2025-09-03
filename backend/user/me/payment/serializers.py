from rest_framework import serializers
from django.utils.translation import gettext as _


class CardSerializer(serializers.Serializer):
    brand = serializers.CharField(source="card.brand")
    display_brand = serializers.CharField(source="card.display_brand")
    last4 = serializers.CharField(source="card.last4")
    exp_month = serializers.IntegerField(source="card.exp_month")
    exp_year = serializers.IntegerField(source="card.exp_year")
    holder = serializers.CharField(source="billing_details.name")
    wallet = serializers.CharField(
        source="card.wallet.type", allow_null=True, default=None
    )


class PaypalSerializer(serializers.Serializer):
    payer_email = serializers.CharField(source="paypal.payer_email")


class PaymentMethodSerializer(serializers.Serializer):
    id = serializers.CharField()
    type = serializers.CharField()
    is_default = serializers.SerializerMethodField()
    details = serializers.SerializerMethodField()

    def get_is_default(self, obj):
        default_id = self.context.get("default_payment_method")
        return obj.get("id") == default_id

    def get_details(self, obj):
        if obj.get("type") == "card":
            return CardSerializer(obj).data
        elif obj.get("type") == "paypal":
            return PaypalSerializer(obj).data
        elif obj.get("type") == "revolut_pay":
            return {}
        return {}
