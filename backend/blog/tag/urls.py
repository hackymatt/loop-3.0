from core.routers import Router
from django.urls import path, include
from .views import TagViewSet
from const import Urls

router = Router(trailing_slash=False)
router.register(Urls.POST_TAG, TagViewSet, basename="post-tags")

urlpatterns = [
    path("", include(router.urls)),
]
