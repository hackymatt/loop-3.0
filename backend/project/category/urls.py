from core.routers import Router
from django.urls import path, include
from .views import CategoryViewSet
from const import Urls

router = Router(trailing_slash=False)
router.register(Urls.Project_CATEGORY, CategoryViewSet, basename="project-categories")

urlpatterns = [
    path("", include(router.urls)),
]
