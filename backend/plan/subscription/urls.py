from .views import SubscribeView
from django.urls import path
from const import Urls


urlpatterns = [
    path(Urls.SUBSCRIBE, SubscribeView.as_view(), name="subscribe"),
]
