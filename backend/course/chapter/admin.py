from django.contrib import admin
from .models import Chapter, ChapterTranslation, Lesson, ChapterLesson

admin.site.register(Chapter)
admin.site.register(ChapterTranslation)
admin.site.register(Lesson)
admin.site.register(ChapterLesson)
