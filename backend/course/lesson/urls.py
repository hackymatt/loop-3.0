from .views import (
    LessonViewSet,
    LessonProgressAPIView,
    LessonSubmitAPIView,
    LessonAnswerAPIView,
    LessonHintAPIView,
)
from django.urls import path
from const import Urls

urlpatterns = [
    path(
        Urls.LESSON,
        LessonViewSet.as_view({"get": "retrieve"}),
        name="lesson",
    ),
    path(
        Urls.LESSON_PROGRESS,
        LessonProgressAPIView.as_view(),
        name="lesson-progress",
    ),
    path(
        Urls.LESSON_SUBMIT,
        LessonSubmitAPIView.as_view(),
        name="lesson-submit",
    ),
    path(
        Urls.LESSON_ANSWER,
        LessonAnswerAPIView.as_view(),
        name="lesson-answer",
    ),
    path(
        Urls.LESSON_HINT,
        LessonHintAPIView.as_view(),
        name="lesson-hint",
    ),
]
