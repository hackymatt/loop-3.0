from core.routers import Router
from django.urls import path, include
from .views import LevelViewSet
from const import Urls

router = Router(trailing_slash=False)
router.register(Urls.PROJECT_LEVEL, LevelViewSet, basename="project-levels")

urlpatterns = [
    path("", include(router.urls)),
]
