import boto3
from rest_framework import serializers
from invoice.models import StudentInvoice
from invoice.utils import get_invoice_number as get_number
from global_config import CONFIG


s3_client = boto3.client(
    "s3",
    aws_access_key_id=CONFIG["s3"]["access_key"],
    aws_secret_access_key=CONFIG["s3"]["secret_key"],
    endpoint_url=CONFIG["s3"]["endpoint_url"],
    region_name=CONFIG["s3"]["region_name"],
)


class InvoiceSerializer(serializers.ModelSerializer):
    invoice_number = serializers.SerializerMethodField()
    invoice_date = serializers.DateField(source="invoice.invoice_date")
    currency = serializers.CharField(source="invoice.currency")
    amount = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    class Meta:
        model = StudentInvoice
        fields = ["invoice_number", "invoice_date", "amount", "currency", "url"]

    def get_invoice_number(self, obj):
        return get_number(obj.invoice.invoice_number)

    def get_amount(self, obj):
        return obj.invoice.amount

    def get_url(self, obj):
        folder_name = obj.invoice.invoice_date.strftime("%Y/%m")
        file_path = f'{CONFIG["invoice_location"]}/{folder_name}/{self.get_invoice_number(obj)}.pdf'

        return s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": CONFIG["s3"]["bucket_name"],
                "Key": file_path,
            },
            ExpiresIn=3600,
        )
