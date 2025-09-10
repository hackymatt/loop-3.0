from django.contrib import admin
from .models import (
    PaymentMethod,
    CardPaymentMethod,
    PayPalPaymentMethod,
    RevolutPaymentMethod,
)


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


class CardPaymentMethodInline(admin.StackedInline):
    model = CardPaymentMethod
    extra = 1


class PayPalPaymentMethodInline(admin.StackedInline):
    model = PayPalPaymentMethod
    extra = 1


class RevolutPaymentMethodInline(admin.StackedInline):
    model = RevolutPaymentMethod
    extra = 1


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ["student", "type", "stripe_payment_method_id", "is_default"]
    list_filter = ["type", "is_default"]
    search_fields = ["student__user__email", "stripe_payment_method_id"]
    inlines = [
        CardPaymentMethodInline,
        PayPalPaymentMethodInline,
        RevolutPaymentMethodInline,
    ]
    ordering = ["-created_at"]


@admin.register(CardPaymentMethod)
class CardPaymentMethodAdmin(admin.ModelAdmin):
    list_display = get_all_fields(CardPaymentMethod)
    search_fields = ["payment_method__student__user__email", "last4", "brand"]
    ordering = ["-payment_method__created_at"]


@admin.register(PayPalPaymentMethod)
class PayPalPaymentMethodAdmin(admin.ModelAdmin):
    list_display = get_all_fields(PayPalPaymentMethod)
    search_fields = ["payment_method__student__user__email", "payer_email"]
    ordering = ["-payment_method__created_at"]


@admin.register(RevolutPaymentMethod)
class RevolutPaymentMethodAdmin(admin.ModelAdmin):
    list_display = get_all_fields(RevolutPaymentMethod)
    search_fields = ["payment_method__student__user__email"]
    ordering = ["-payment_method__created_at"]
