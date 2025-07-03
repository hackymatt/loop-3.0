from django.urls import path, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
import debug_toolbar
from const import Urls

from user.urls import urlpatterns as user_urls
from course.urls import urlpatterns as course_urls
from review.urls import urlpatterns as review_urls
from contact.urls import urlpatterns as contact_urls
from blog.urls import urlpatterns as blog_urls
from plan.urls import urlpatterns as plan_urls
from certificate.urls import urlpatterns as certificate_urls

api_urlpatterns = (
    user_urls
    + course_urls
    + review_urls
    + contact_urls
    + blog_urls
    + plan_urls
    + certificate_urls
)

# Main URL patterns
urlpatterns = [
    # Include all the API URLs under the /api prefix
    path(f"{Urls.API}/", include(api_urlpatterns)),
    # Admin route
    path(f"{Urls.ADMIN}/", admin.site.urls),
]

# Debug toolbar and static/media settings in development mode
if settings.DEBUG:
    urlpatterns += [
        path("__debug__/", include(debug_toolbar.urls)),
    ]  # pragma: no cover
    urlpatterns += static(
        settings.STATIC_URL, document_root=settings.STATIC_ROOT
    )  # pragma: no cover
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )  # pragma: no cover
