from django.contrib import admin
from .models import Instructor


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Instructor)
    search_fields = ("user__email", "user__username", "role")
