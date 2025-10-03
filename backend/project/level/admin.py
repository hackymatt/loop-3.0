from django.contrib import admin
from .models import Level, LevelTranslation


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


class LevelTranslationInline(admin.TabularInline):
    model = LevelTranslation
    extra = 1


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Level)
    search_fields = ("slug",)
    ordering = ("order",)
    inlines = [LevelTranslationInline]


@admin.register(LevelTranslation)
class LevelTranslationAdmin(admin.ModelAdmin):
    list_display = get_all_fields(LevelTranslation)
    search_fields = ("level__slug", "language", "name")
    list_filter = ("language",)
