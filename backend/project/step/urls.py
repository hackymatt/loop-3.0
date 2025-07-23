from .views import StepViewSet
from django.urls import path
from const import Urls

urlpatterns = [
    path(
        Urls.STEP,
        StepViewSet.as_view({"get": "retrieve"}),
        name="step",
    ),
]

