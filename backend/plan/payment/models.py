from django.db import models
from django.utils import timezone
from core.base_model import BaseModel
from user.type.student_user.models import Student
from const import PaymentType


class PaymentMethod(BaseModel):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="payment_methods"
    )
    stripe_payment_method_id = models.CharField(max_length=100, unique=True)
    type = models.CharField(max_length=20, choices=PaymentType.choices)
    is_default = models.BooleanField(default=False)

    class Meta:
        db_table = "payment_method"
        verbose_name = "Payment Method"
        verbose_name_plural = "Payment Methods"

    def __str__(self):
        return f"{self.student.user.email} ({self.type})"


class CardPaymentMethod(BaseModel):
    payment_method = models.OneToOneField(
        PaymentMethod, on_delete=models.CASCADE, related_name="card"
    )
    brand = models.CharField(max_length=50)
    display_brand = models.CharField(max_length=50)
    last4 = models.CharField(max_length=4)
    exp_month = models.PositiveIntegerField()
    exp_year = models.PositiveIntegerField()
    holder = models.CharField(max_length=50, null=True)
    wallet = models.CharField(max_length=50, blank=True, null=True, default=None)

    class Meta:
        db_table = "payment_method_card"
        verbose_name = "Card Payment Method"
        verbose_name_plural = "Card Payment Methods"

    def __str__(self):
        return f"{self.payment_method.student.user.email} {self.pk}"


class PayPalPaymentMethod(BaseModel):
    payment_method = models.OneToOneField(
        PaymentMethod, on_delete=models.CASCADE, related_name="paypal"
    )
    payer_email = models.EmailField(null=True)

    class Meta:
        db_table = "payment_method_paypal"
        verbose_name = "PayPal Payment Method"
        verbose_name_plural = "PayPal Payment Methods"

    def __str__(self):
        return f"{self.payment_method.student.user.email} {self.pk}"


class RevolutPaymentMethod(BaseModel):
    payment_method = models.OneToOneField(
        PaymentMethod, on_delete=models.CASCADE, related_name="revolut"
    )

    class Meta:
        db_table = "payment_method_revolutpay"
        verbose_name = "RevolutPay Payment Method"
        verbose_name_plural = "RevolutPay Payment Methods"

    def __str__(self):
        return f"{self.payment_method.student.user.email} {self.pk}"


class PaymentDiscount(BaseModel):
    code = models.CharField(max_length=50, unique=True)
    stripe_promotion_code_id = models.CharField(max_length=100)
    stripe_coupon_id = models.CharField(max_length=100)
    percent_off = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    amount_off = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    expires_at = models.DateTimeField(null=True, blank=True)
    max_redemptions = models.IntegerField(null=True, blank=True)
    active = models.BooleanField(default=False)
    restrictions = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = "payment_discount"
        verbose_name = "Payment Discount"
        verbose_name_plural = "Payment Discounts"

    def __str__(self):
        return self.code

    def is_expired(self):
        return self.expires_at and self.expires_at < timezone.now()
