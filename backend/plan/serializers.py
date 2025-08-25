from rest_framework import serializers
from .models import Plan, PlanPricing
from const import PaymentInterval


class PlanPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanPricing
        fields = [
            "currency",
            "interval",
            "price",
        ]


class PlanSerializer(serializers.ModelSerializer):
    license = serializers.SerializerMethodField()
    pricing = serializers.SerializerMethodField()
    options = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = [
            "type",
            "tokens_limit",
            "license",
            "popular",
            "premium",
            "pricing",
            "options",
        ]

    def get_license(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        translation = obj.get_translation(lang)
        return translation.license if translation else None

    def get_pricing(self, obj):
        pricing = PlanPricing.objects.filter(plan=obj)
        return PlanPricingSerializer(pricing, many=True).data

    def get_options(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        options = obj.plan_options.all()
        return [
            {
                "title": po.option.get_translation(lang).title
                if po.option.get_translation(lang)
                else None,
                "disabled": po.disabled,
            }
            for po in options
        ]
