from django.contrib import admin
from .models import Stage, StageTranslation, StageStep


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


class StageTranslationInline(admin.TabularInline):
    model = StageTranslation
    extra = 1


@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Stage)
    search_fields = ('slug',)
    list_filter = ('active',)
    inlines = [StageTranslationInline]


@admin.register(StageTranslation)
class StageTranslationAdmin(admin.ModelAdmin):
    list_display = get_all_fields(StageTranslation)
    search_fields = ('stage__slug', 'language', 'name')
    list_filter = ('language',)


@admin.register(StageStep)
class StageStepAdmin(admin.ModelAdmin):
    list_display = get_all_fields(StageStep)
    search_fields = ('stage__slug', 'step__slug')
    list_filter = ('stage',)
