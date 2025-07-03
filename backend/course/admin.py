from django.contrib import admin
from .models import Course, CourseTranslation, CourseChapter

admin.site.register(Course)
admin.site.register(CourseTranslation)
admin.site.register(CourseChapter)
