from django.contrib import admin
from .models import Project, ProjectTranslation, ProjectStage

admin.site.register(Project)
admin.site.register(ProjectTranslation)
admin.site.register(ProjectStage)
