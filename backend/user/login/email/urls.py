from django.urls import path
from .views import LoginView


from const import Urls

urlpatterns = [
    path(Urls.LOGIN, LoginView.as_view(), name="login"),
]
