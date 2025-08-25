from django.contrib import admin
from .models import Project, ProjectTranslation, ProjectStage


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


class ProjectTranslationInline(admin.TabularInline):
    model = ProjectTranslation
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Project)
    search_fields = ('slug', 'level__slug', 'category__slug')
    list_filter = ('active', 'level', 'category')
    filter_horizontal = (
        'technology',
        'instructors',
        'project_prerequisites',
        'blog_prerequisites',
        'similar',
        'tags',
    )
    inlines = [ProjectTranslationInline]


@admin.register(ProjectTranslation)
class ProjectTranslationAdmin(admin.ModelAdmin):
    list_display = get_all_fields(ProjectTranslation)
    search_fields = ('project__slug', 'language', 'name')
    list_filter = ('language',)


@admin.register(ProjectStage)
class ProjectStageAdmin(admin.ModelAdmin):
    list_display = get_all_fields(ProjectStage)
    search_fields = ('project__slug', 'stage__slug')
    list_filter = ('project', 'stage')
