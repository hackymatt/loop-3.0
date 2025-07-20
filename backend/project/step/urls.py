# from .views import (
#     StepViewSet,
#     StepProgressAPIView,
#     StepSubmitAPIView,
#     StepAnswerAPIView,
#     StepHintAPIView,
# )
# from django.urls import path
# from const import Urls

# urlpatterns = [
#     path(
#         Urls.LESSON,
#         StepViewSet.as_view({"get": "retrieve"}),
#         name="step",
#     ),
#     path(
#         Urls.LESSON_PROGRESS,
#         StepProgressAPIView.as_view(),
#         name="step-progress",
#     ),
#     path(
#         Urls.LESSON_SUBMIT,
#         StepSubmitAPIView.as_view(),
#         name="step-submit",
#     ),
#     path(
#         Urls.LESSON_ANSWER,
#         StepAnswerAPIView.as_view(),
#         name="step-answer",
#     ),
#     path(
#         Urls.LESSON_HINT,
#         StepHintAPIView.as_view(),
#         name="step-hint",
#     ),
# ]

urlpatterns = []