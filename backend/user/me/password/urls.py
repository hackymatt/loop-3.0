from django.urls import path
from .views import ChangePasswordView


from const import Urls

urlpatterns = [
    path(Urls.PASSWORD_CHANGE, ChangePasswordView.as_view(), name="password"),
]
