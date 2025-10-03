from django.contrib import admin
from .models import Technology


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


@admin.register(Technology)
class TechnologyAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Technology)
    search_fields = ("slug", "name")
