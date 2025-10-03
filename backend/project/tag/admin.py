from django.contrib import admin
from .models import Tag, TagTranslation


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


class TagTranslationInline(admin.TabularInline):
    model = TagTranslation
    extra = 1


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Tag)
    search_fields = ("slug",)
    inlines = [TagTranslationInline]


@admin.register(TagTranslation)
class TagTranslationAdmin(admin.ModelAdmin):
    list_display = get_all_fields(TagTranslation)
    search_fields = ("tag__slug", "language", "name")
    list_filter = ("language",)
