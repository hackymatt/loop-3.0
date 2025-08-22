from .views import ChannelPostViewSet, ChannelPostCommentViewSet, ChannelPostLikeViewSet
from django.urls import path
from const import Urls

urlpatterns = [
path(
    Urls.PROJECT_CHANNEL_POSTS,
    ChannelPostViewSet.as_view({"get": "list", "post": "create"}),
    name="project-channel-posts",
),
path(
    f"{Urls.PROJECT_CHANNEL_POSTS}/<int:post_id>",
    ChannelPostViewSet.as_view({"delete": "destroy"}),
    name="project-channel-post-delete",
),
path(
    Urls.PROJECT_CHANNEL_POST_COMMENTS,
    ChannelPostCommentViewSet.as_view({"post": "create"}),
    name="project-channel-post-comments",
),
path(
    f"{Urls.PROJECT_CHANNEL_POST_COMMENTS}/<int:post_id>/<int:comment_id>",
    ChannelPostCommentViewSet.as_view({"delete": "destroy"}),
    name="project-channel-post-comment-delete",
),
path(
    Urls.PROJECT_CHANNEL_POST_LIKES,
    ChannelPostLikeViewSet.as_view({"post": "create"}),
    name="project-channel-post-likes",
),
]
