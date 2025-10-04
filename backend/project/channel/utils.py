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
        if img.image:
            if CONFIG["is_local"]:
                # Local storage
                if os.path.isfile(img.image.path):
                    os.remove(img.image.path)
            else:
                # S3 storage
                img.image.delete(save=False)

        # Delete DB record
        img.delete()
