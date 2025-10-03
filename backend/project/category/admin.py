from django.contrib import admin
from .models import Category, CategoryTranslation


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


class CategoryTranslationInline(admin.TabularInline):
    model = CategoryTranslation
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Category)
    search_fields = ("slug",)
    inlines = [CategoryTranslationInline]


@admin.register(CategoryTranslation)
class CategoryTranslationAdmin(admin.ModelAdmin):
    list_display = get_all_fields(CategoryTranslation)
    search_fields = ("category__slug", "language", "name")
    list_filter = ("language",)
