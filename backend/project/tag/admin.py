from django.contrib import admin
from .models import Tag, TagTranslation

admin.site.register(Tag)
admin.site.register(TagTranslation)
