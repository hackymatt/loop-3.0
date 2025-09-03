from django.urls import path, include

from const import Urls
from .me.urls import urlpatterns as me_urls
from .dashboard.urls import urlpatterns as dashboard_urls
from .activate.urls import urlpatterns as activate_urls
from .register.urls import urlpatterns as register_urls
from .login.urls import urlpatterns as login_urls
from .logout.urls import urlpatterns as logout_urls
from .reset_password.urls import urlpatterns as password_urls
from .refresh_token.urls import urlpatterns as refresh_token_urls


# Define all your API URL patterns
urlpatterns = [
    # Registration and activation routes
    path("", include(register_urls)),
    path("", include(activate_urls)),
    # Login routes
    path("", include(login_urls)),
    # Logout routes
    path("", include(logout_urls)),
    # Password routes
    path("", include(password_urls)),
    # Auth helpers
    path("", include(refresh_token_urls)),
    # User routes
    path("", include(me_urls)),
    path("", include(dashboard_urls)),
]
