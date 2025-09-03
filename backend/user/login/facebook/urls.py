from django.urls import path
from .views import FacebookLoginView


from const import Urls

urlpatterns = [
    path(Urls.FACEBOOK_LOGIN, FacebookLoginView.as_view(), name="facebook-login"),
]
