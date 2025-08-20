from django.contrib import admin
from .models import ChannelPost, ChannelPostLike, ChannelPostComment

admin.site.register(ChannelPost)
admin.site.register(ChannelPostLike)
admin.site.register(ChannelPostComment)
