from .topic.urls import urlpatterns as topic_urls
from .tag.urls import urlpatterns as tag_urls
from .views import BlogViewSet, RecentBlogsView, FeaturedBlogView
from core.routers import Router
from django.urls import path, include
from const import Urls


blog_urlpatterns = topic_urls + tag_urls

router = Router(trailing_slash=False)
router.register(Urls.POST, BlogViewSet, basename="posts")

urlpatterns = [
    path("", include(blog_urlpatterns)),
    path("", include(router.urls)),
    path(Urls.RECENT_POST, RecentBlogsView.as_view(), name="recent-posts"),
    path(Urls.FEATURED_POST, FeaturedBlogView.as_view(), name="featured-post"),
]
