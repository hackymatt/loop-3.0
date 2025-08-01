from .views import StepViewSet, StepChatView
from django.urls import path
from const import Urls

urlpatterns = [
    path(
        Urls.STEP,
        StepViewSet.as_view({"get": "retrieve"}),
        name="step",
    ),
    path(Urls.STEP_CHAT, StepChatView.as_view(), name="step-chat"),
]
