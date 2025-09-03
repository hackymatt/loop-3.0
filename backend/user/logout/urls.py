from django.urls import path
from .views import LogoutView


from const import Urls

urlpatterns = [
    path(Urls.LOGOUT, LogoutView.as_view(), name="logout"),
]
