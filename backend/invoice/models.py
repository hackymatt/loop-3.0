from django.db import models
from core.base_model import BaseModel
from const import Currency, PaymentStatus, PaymentMethod


class InvoiceCustomer(models.Model):
    email = models.EmailField()
    full_name = models.CharField(max_length=255)
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=64)

    def __str__(self):  # pragma: no cover
        return self.full_name

    class Meta:
        db_table = "invoice_customer"


class InvoiceItem(models.Model):
    item_id = models.IntegerField()
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()

    def __str__(self):  # pragma: no cover
        return self.name

    class Meta:
        db_table = "invoice_item"


class Invoice(BaseModel):
    customer = models.ForeignKey(InvoiceCustomer, on_delete=models.PROTECT)
    items = models.ManyToManyField(InvoiceItem)
    currency = models.CharField(
        max_length=3, choices=Currency.choices, default=Currency.PLN
    )
    status = models.CharField(
        max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.PAID
    )
    method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.STRIPE
    )
    notes = models.TextField(null=True)
    auto_generate = models.BooleanField(default=False)

    def __str__(self):  # pragma: no cover
        return f"{self.customer.full_name} - {self.pk}"

    @property
    def amount(self):
        return sum(item.price * item.quantity for item in self.items.all())

    class Meta:
        db_table = "invoice"
