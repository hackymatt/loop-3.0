from core.routers import Router
from django.urls import path, include
from .views import TopicViewSet
from const import Urls

router = Router(trailing_slash=False)
router.register(Urls.POST_TOPIC, TopicViewSet, basename="post-topics")

urlpatterns = [
    path("", include(router.urls)),
]
