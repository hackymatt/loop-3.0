from django.contrib import admin
from .models import ChannelPost, ChannelPostLike, ChannelPostComment, ChannelPostImage


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


@admin.register(ChannelPost)
class ChannelPostAdmin(admin.ModelAdmin):
    list_display = get_all_fields(ChannelPost)
    search_fields = (
        "title",
        "student__user__first_name",
        "student__user__last_name",
        "project__slug",
    )
    list_filter = ("language", "project")


@admin.register(ChannelPostLike)
class ChannelPostLikeAdmin(admin.ModelAdmin):
    list_display = get_all_fields(ChannelPostLike)
    search_fields = (
        "channel_post__title",
        "student__user__first_name",
        "student__user__last_name",
    )


@admin.register(ChannelPostComment)
class ChannelPostCommentAdmin(admin.ModelAdmin):
    list_display = get_all_fields(ChannelPostComment)
    search_fields = (
        "channel_post__title",
        "student__user__first_name",
        "student__user__last_name",
        "message",
    )


@admin.register(ChannelPostImage)
class ChannelPostImageAdmin(admin.ModelAdmin):
    list_display = get_all_fields(ChannelPostImage)
    search_fields = (
        "student__user__first_name",
        "student__user__last_name",
    )
