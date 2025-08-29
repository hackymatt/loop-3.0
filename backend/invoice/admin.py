from django.contrib import admin
from .models import InvoiceCustomer, InvoiceItem, Invoice


@admin.register(InvoiceCustomer)
class InvoiceCustomerAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "city", "country")
    search_fields = ("full_name", "email", "city", "zip_code", "country")


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = ("item_id", "name", "price", "quantity")
    search_fields = ("item_id", "name")


class InvoiceItemInline(admin.TabularInline):
    model = Invoice.items.through
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "status", "method", "currency")
    list_filter = ("status", "method", "currency")
    search_fields = ("customer__full_name", "customer__email")
    inlines = [InvoiceItemInline]
    exclude = ("items",)  # items będą dodawane przez inline
