from rest_framework import serializers
from django.utils.translation import gettext as _
from plan.payment.models import (
    PaymentMethod,
    CardPaymentMethod,
    PayPalPaymentMethod,
    RevolutPaymentMethod,
)
from const import PaymentType


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardPaymentMethod
        fields = [
            "brand",
            "display_brand",
            "last4",
            "exp_month",
            "exp_year",
            "holder",
            "wallet",
        ]


class PaypalSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayPalPaymentMethod
        fields = ["payer_email"]


class RevolutSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevolutPaymentMethod
        fields = "__all__"

    def to_representation(self, instance):
        return {}


class PaymentMethodSerializer(serializers.ModelSerializer):
    details = serializers.SerializerMethodField()

    class Meta:
        model = PaymentMethod
        fields = ["id", "type", "is_default", "details"]

    def get_details(self, obj):
        if obj.type == PaymentType.CARD:
            card = CardPaymentMethod.objects.get(payment_method=obj)
            return CardSerializer(card).data
        elif obj.type == PaymentType.PAYPAL:
            paypal = PayPalPaymentMethod.objects.get(payment_method=obj)
            return PaypalSerializer(paypal).data
        else:
            revolut = RevolutPaymentMethod.objects.get(payment_method=obj)
            return RevolutSerializer(revolut).data
