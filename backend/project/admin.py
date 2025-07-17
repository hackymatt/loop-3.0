from django.contrib import admin
from .models import Project, ProjectTranslation, ProjectStep

admin.site.register(Project)
admin.site.register(ProjectTranslation)
admin.site.register(ProjectStep)
