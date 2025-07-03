from rest_framework import serializers
from .models import Plan, PlanOption


class PlanSerializer(serializers.Serializer):
    slug = serializers.CharField()
    license = serializers.SerializerMethodField()
    popular = serializers.BooleanField()
    premium = serializers.BooleanField()
    price = serializers.SerializerMethodField()
    options = serializers.SerializerMethodField()

    def get_license(self, obj: Plan):
        lang = self.context.get("request").LANGUAGE_CODE
        translation = obj.get_translation(lang)
        return translation.license if translation else None

    def get_price(self, obj: Plan):
        return {
            "monthly": float(obj.monthly_price),
            "yearly": float(obj.yearly_price),
        }

    def get_options(self, obj: Plan):
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
