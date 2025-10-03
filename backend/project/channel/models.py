import markdown
from django.db import models
from django.core.exceptions import ValidationError
from mdeditor import fields
from core.base_model import BaseModel
from ..models import Project
from user.type.student_user.models import Student
from const import Language


class ChannelPost(BaseModel):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="channel_posts"
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="channel_posts"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    title = models.CharField(max_length=255)
    message = fields.MDTextField()

    class Meta:
        db_table = "channel_post"
        verbose_name_plural = "Channel posts"

    def clean(self):  # pragma: no cover
        try:
            markdown.markdown(self.message)
        except Exception as e:
            raise ValidationError({"message": f"Invalid Markdown: {str(e)}"})

    def __str__(self):  # pragma: no cover
        return f"Post {self.pk} by {self.student.user.first_name} {self.student.user.last_name}"


class ChannelPostLike(BaseModel):
    channel_post = models.ForeignKey(
        ChannelPost, on_delete=models.CASCADE, related_name="likes"
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="liked_posts"
    )

    class Meta:
        db_table = "channel_post_like"
        unique_together = ("channel_post", "student")
        verbose_name_plural = "Channel post likes"

    def __str__(self):  # pragma: no cover
        return f"Like {self.pk} on Post {self.channel_post.pk}"


class ChannelPostComment(BaseModel):
    channel_post = models.ForeignKey(
        ChannelPost, on_delete=models.CASCADE, related_name="comments"
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="comments"
    )
    message = fields.MDTextField()

    class Meta:
        db_table = "channel_post_comment"
        verbose_name_plural = "Channel post comments"

    def clean(self):  # pragma: no cover
        try:
            markdown.markdown(self.message)
        except Exception as e:
            raise ValidationError({"message": f"Invalid Markdown: {str(e)}"})

    def __str__(self):  # pragma: no cover
        return f"Comment {self.pk} on Post {self.channel_post.pk}"
