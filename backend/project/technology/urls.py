from core.routers import Router
from django.urls import path, include
from .views import TechnologyViewSet, FeaturedTechnologiesView
from const import Urls

router = Router(trailing_slash=False)
router.register(
    Urls.Project_TECHNOLOGY, TechnologyViewSet, basename="project-technologies"
)

urlpatterns = [
    path("", include(router.urls)),
    path(
        Urls.FEATURED_TECHNOLOGIES,
        FeaturedTechnologiesView.as_view(),
        name="featured-projects",
    ),
]
