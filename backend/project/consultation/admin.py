from django.contrib import admin
from .models import Consultation


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Consultation)
    search_fields = (
        "student__user__first_name",
        "student__user__last_name",
        "project__slug",
    )
    list_filter = ("scheduled_at", "project")
