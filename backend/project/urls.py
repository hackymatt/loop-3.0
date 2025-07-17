from .level.urls import urlpatterns as level_urls
from .technology.urls import urlpatterns as technology_urls
from .category.urls import urlpatterns as category_urls
from .substep.urls import urlpatterns as substep_urls
from .views import ProjectViewSet, FeaturedProjectsView, SimilarProjectsView
from core.routers import Router
from django.urls import path, include
from const import Urls


project_urlpatterns = level_urls + technology_urls + category_urls + substep_urls

router = Router(trailing_slash=False)
router.register(Urls.PROJECT, ProjectViewSet, basename="projects")

urlpatterns = [
    path("", include(project_urlpatterns)),
    path("", include(router.urls)),
    path(Urls.FEATURED_PROJECT, FeaturedProjectsView.as_view(), name="featured-projects"),
    path(Urls.SIMILAR_PROJECTS, SimilarProjectsView.as_view(), name="similar-projects"),
]
