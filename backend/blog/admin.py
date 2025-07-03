from django.contrib import admin
from .models import Blog, BlogTranslation

admin.site.register(Blog)
admin.site.register(BlogTranslation)
