import os
from .models import ChannelPost, ChannelPostImage, ChannelPostComment
from global_config import CONFIG


def remove_unused_images():
    images = ChannelPostImage.objects.all()

    for img in images:
        image_url = img.image.url

        # Skip if used in a post
        if ChannelPost.objects.filter(message__icontains=image_url).exists():
            continue

        # Skip if used in a comment
        if ChannelPostComment.objects.filter(message__icontains=image_url).exists():
            continue

        # Delete file from storage
        os.remove(img.image.path) if CONFIG["is_local"] and os.path.isfile(
            img.image.path
        ) else img.image.delete(save=False)

        # Delete DB record
        img.delete()
