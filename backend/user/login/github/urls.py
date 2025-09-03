from django.urls import path
from .views import GithubLoginView


from const import Urls

urlpatterns = [
    path(Urls.GITHUB_LOGIN, GithubLoginView.as_view(), name="github-login"),
]
