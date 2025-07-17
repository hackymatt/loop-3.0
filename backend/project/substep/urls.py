# from .views import (
#     SubstepViewSet,
#     SubstepProgressAPIView,
#     SubstepSubmitAPIView,
#     SubstepAnswerAPIView,
#     SubstepHintAPIView,
# )
# from django.urls import path
# from const import Urls

# urlpatterns = [
#     path(
#         Urls.LESSON,
#         SubstepViewSet.as_view({"get": "retrieve"}),
#         name="substep",
#     ),
#     path(
#         Urls.LESSON_PROGRESS,
#         SubstepProgressAPIView.as_view(),
#         name="substep-progress",
#     ),
#     path(
#         Urls.LESSON_SUBMIT,
#         SubstepSubmitAPIView.as_view(),
#         name="substep-submit",
#     ),
#     path(
#         Urls.LESSON_ANSWER,
#         SubstepAnswerAPIView.as_view(),
#         name="substep-answer",
#     ),
#     path(
#         Urls.LESSON_HINT,
#         SubstepHintAPIView.as_view(),
#         name="substep-hint",
#     ),
# ]

urlpatterns = []