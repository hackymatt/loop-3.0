from django.contrib import admin
from .models import ProjectProgress


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


@admin.register(ProjectProgress)
class ProjectProgressAdmin(admin.ModelAdmin):
    list_display = get_all_fields(ProjectProgress)
    search_fields = ("student__user__email", "step__slug")
    list_filter = ("completed_at",)
