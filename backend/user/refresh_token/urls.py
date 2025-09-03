from django.urls import path
from .views import RefreshTokenView


from const import Urls

urlpatterns = [
    path(Urls.REFRESH_TOKEN, RefreshTokenView.as_view(), name="refresh-token"),
]
