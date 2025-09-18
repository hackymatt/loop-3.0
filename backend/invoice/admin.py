from django.contrib import admin
from .models import InvoiceCustomer, InvoiceItem, Invoice, StudentInvoice


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


@admin.register(InvoiceCustomer)
class InvoiceCustomerAdmin(admin.ModelAdmin):
    list_display = get_all_fields(InvoiceCustomer)
    search_fields = ("full_name", "email", "city", "zip_code", "country")


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = get_all_fields(InvoiceItem)
    search_fields = ("item_id", "name")


class InvoiceItemInline(admin.TabularInline):
    model = Invoice.items.through
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        "invoice_number",
        "invoice_date",
        "service_date",
        "customer",
        "status",
        "method",
        "currency",
    )
    list_filter = get_all_fields(Invoice)
    search_fields = ("customer__full_name", "customer__email")
    inlines = [InvoiceItemInline]
    exclude = ("items",)  # items będą dodawane przez inline


@admin.register(StudentInvoice)
class StudentInvoiceAdmin(admin.ModelAdmin):
    list_display = get_all_fields(StudentInvoice)
    search_fields = (
        "student__user__email",
        "student__first_name",
        "student__last_name",
        "invoice__invoice_number",
    )
    list_filter = ("invoice__status", "invoice__currency")
