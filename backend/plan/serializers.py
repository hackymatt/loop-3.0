from rest_framework import serializers
from .models import Plan


class PlanSerializer(serializers.ModelSerializer):
    license = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    options = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = [
            "slug",
            "tokens_limit",
            "license",
            "popular",
            "premium",
            "price",
            "currency",
            "options",
        ]

    def get_license(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        translation = obj.get_translation(lang)
        return translation.license if translation else None

    def get_price(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        translation = obj.get_translation(lang)
        return (
            {
                "monthly": float(translation.monthly_price),
                "yearly": float(translation.yearly_price),
            }
            if translation
            else None
        )

    def get_currency(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        translation = obj.get_translation(lang)
        return translation.currency if translation else None

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
