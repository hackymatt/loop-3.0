from django.urls import path
from .views import GoogleLoginView


from const import Urls

urlpatterns = [path(Urls.GOOGLE_LOGIN, GoogleLoginView.as_view(), name="google-login")]
