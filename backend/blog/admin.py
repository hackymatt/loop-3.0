from django.contrib import admin
from .models import Blog, BlogTranslation


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


class BlogTranslationInline(admin.TabularInline):
    model = BlogTranslation
    extra = 1


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Blog)
    search_fields = ("slug", "topic__name", "author__user__username")
    list_filter = ("active", "published_at", "topic")
    filter_horizontal = ("tags",)
    inlines = [BlogTranslationInline]


@admin.register(BlogTranslation)
class BlogTranslationAdmin(admin.ModelAdmin):
    list_display = get_all_fields(BlogTranslation)
    search_fields = ("name", "language", "blog__slug")
    list_filter = ("language",)
