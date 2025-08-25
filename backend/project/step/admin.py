from django.contrib import admin
from .models import Step, StepTranslation


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


class StepTranslationInline(admin.TabularInline):
    model = StepTranslation
    extra = 1


@admin.register(Step)
class StepAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Step)
    search_fields = ("slug",)
    list_filter = ("active",)
    inlines = [StepTranslationInline]


@admin.register(StepTranslation)
class StepTranslationAdmin(admin.ModelAdmin):
    list_display = get_all_fields(StepTranslation)
    search_fields = ("step__slug", "language", "name")
    list_filter = ("language",)
