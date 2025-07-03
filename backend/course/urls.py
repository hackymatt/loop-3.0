from .level.urls import urlpatterns as level_urls
from .technology.urls import urlpatterns as technology_urls
from .category.urls import urlpatterns as category_urls
from .lesson.urls import urlpatterns as lesson_urls
from .views import CourseViewSet, FeaturedCoursesView, SimilarCoursesView
from core.routers import Router
from django.urls import path, include
from const import Urls


course_urlpatterns = level_urls + technology_urls + category_urls + lesson_urls

router = Router(trailing_slash=False)
router.register(Urls.COURSE, CourseViewSet, basename="courses")

urlpatterns = [
    path("", include(course_urlpatterns)),
    path("", include(router.urls)),
    path(Urls.FEATURED_COURSE, FeaturedCoursesView.as_view(), name="featured-courses"),
    path(Urls.SIMILAR_COURSES, SimilarCoursesView.as_view(), name="similar-courses"),
]
