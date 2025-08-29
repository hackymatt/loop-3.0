from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from django.core.files.storage import get_storage_class
from ..utils import check_password
from plan.subscription.models import PlanSubscription
from invoice.models import StudentInvoice
from invoice.utils import get_invoice_number as get_number
from global_config import CONFIG


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


class InvoiceSerializer(serializers.ModelSerializer):
    invoice_number = serializers.SerializerMethodField()
    invoice_date = serializers.DateField(source="invoice.invoice_date")
    currency = serializers.CharField(source="invoice.currency")
    amount = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    class Meta:
        model = StudentInvoice
        fields = ["invoice_number", "invoice_date", "amount", "currency"]

    def get_invoice_number(self, obj):
        return get_number(obj.invoice.invoice_number)

    def get_amount(self, obj):
        return obj.invoice.amount

    def get_url(self, obj):
        invoices_storage_config = CONFIG["storages"].get(
            "invoices",
            {
                "BACKEND": "storages.backends.s3.S3Storage",
                "OPTIONS": {},
            },
        )
        storage_class = get_storage_class(invoices_storage_config["BACKEND"])
        storage = storage_class(**invoices_storage_config["OPTIONS"])

        folder_name = obj.invoice.invoice_date.strftime("%Y%m%d")
        file_path = f"{folder_name}/{self.get_invoice_number(obj)}.pdf"
        return storage.url(file_path, querystring_auth=True)
