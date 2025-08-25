from django.contrib import admin
from .models import Topic, TopicTranslation


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


class TopicTranslationInline(admin.TabularInline):
    model = TopicTranslation
    extra = 1


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Topic)
    search_fields = ("slug",)
    inlines = [TopicTranslationInline]


@admin.register(TopicTranslation)
class TopicTranslationAdmin(admin.ModelAdmin):
    list_display = get_all_fields(TopicTranslation)
    search_fields = ("topic__slug", "language", "name")
    list_filter = ("language",)
