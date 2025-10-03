from django.urls import path, include
from .email.urls import urlpatterns as email_login_urls
from .google.urls import urlpatterns as google_login_urls
from .github.urls import urlpatterns as github_login_urls
from .facebook.urls import urlpatterns as facebook_login_urls


from const import Urls

urlpatterns = [
    path("", include(email_login_urls)),
    path("", include(google_login_urls)),
    path("", include(github_login_urls)),
    path("", include(facebook_login_urls)),
]
