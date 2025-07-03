from core.routers import Router
from django.urls import path, include
from .views import CategoryViewSet
from const import Urls

router = Router(trailing_slash=False)
router.register(Urls.COURSE_CATEGORY, CategoryViewSet, basename="course-categories")

urlpatterns = [
    path("", include(router.urls)),
]
