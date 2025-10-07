from .views import ConsultationViewSet
from django.urls import path
from const import Urls

urlpatterns = [
    path(
        Urls.PROJECT_CONSULTATIONS,
        ConsultationViewSet.as_view({"post": "create"}),
        name="project-consultations",
    ),
]
