from django.contrib import admin
from .models import Review


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Review)
    search_fields = ('student__user__email', 'project__slug', 'rating')
    list_filter = ('rating', 'language', 'project')
