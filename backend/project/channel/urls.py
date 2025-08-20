from .views import ChannelViewSet
from django.urls import path
from const import Urls

urlpatterns = [
    path(
        Urls.PROJECT_CHANNEL,
        ChannelViewSet.as_view({"get": "list"}),
        name="project-channel",
    ),
]
