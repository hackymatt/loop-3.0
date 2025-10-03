from django.urls import path
from .views import RegisterView


from const import Urls

urlpatterns = [
    path(Urls.REGISTER, RegisterView.as_view(), name="register"),
]
