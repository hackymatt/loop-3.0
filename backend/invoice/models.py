from django.db import models, transaction
from django.utils import timezone
from core.base_model import BaseModel
from user.type.student_user.models import Student
from const import Currency, PaymentStatus, PaymentMethod, Language
from global_config import CONFIG
from .utils import generate_and_send_invoice


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
    invoice_number = models.PositiveIntegerField(unique=True, editable=False)
    invoice_date = models.DateField(default=timezone.now)
    service_date = models.DateField(default=timezone.now)
    currency = models.CharField(
        max_length=3, choices=Currency.choices, default=Currency.PLN
    )
    status = models.CharField(
        max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.PAID
    )
    method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.STRIPE
    )
    notes = models.TextField(null=True, blank=True)
    language = models.CharField(
        max_length=2, choices=Language.choices, default=Language.PL
    )
    auto_generate = models.BooleanField(default=False)

    def __str__(self):  # pragma: no cover
        return f"{self.customer.full_name} - {self.pk}"

    @property
    def amount(self):
        return sum(item.price * item.quantity for item in self.items.all())

    def save(self, *args, **kwargs):
        if not self.pk:  # only assign a number when creating
            self.invoice_number = self.get_next_invoice_number()
        super().save(*args, **kwargs)

        if self.auto_generate:
            generate_and_send_invoice(
                self, CONFIG["website_url"], self.customer.full_name
            )

    @classmethod
    def get_next_invoice_number(cls):
        with transaction.atomic():
            last_invoice = (
                cls.objects.select_for_update().order_by("-invoice_number").first()
            )
            next_number = 1 if not last_invoice else last_invoice.invoice_number + 1
            return next_number

    class Meta:
        db_table = "invoice"


class StudentInvoice(BaseModel):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="invoices"
    )
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name="students"
    )

    class Meta:
        db_table = "student_invoice"
        unique_together = ("student", "invoice")
