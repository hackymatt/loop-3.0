from django.contrib import admin
from .models import (
    ReadingLesson,
    ReadingLessonTranslation,
    VideoLesson,
    VideoLessonTranslation,
    QuizLesson,
    QuizLessonTranslation,
    QuizQuestion,
    QuizQuestionOption,
    File,
    CodingLesson,
    CodingLessonTranslation,
)

admin.site.register(ReadingLesson)
admin.site.register(ReadingLessonTranslation)
admin.site.register(VideoLesson)
admin.site.register(VideoLessonTranslation)
admin.site.register(QuizLesson)
admin.site.register(QuizLessonTranslation)
admin.site.register(QuizQuestion)
admin.site.register(QuizQuestionOption)
admin.site.register(File)
admin.site.register(CodingLesson)
admin.site.register(CodingLessonTranslation)
