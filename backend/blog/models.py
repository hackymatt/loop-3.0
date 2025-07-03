import os
import uuid
from django.db import models
from core.base_model import BaseModel
from .topic.models import Topic
from .tag.models import Tag
from user.type.instructor_user.models import Instructor
from const import Language


def blog_directory_path(instance, filename):  # pragma: no cover
    """
    Generate a unique filename for the blog's picture.
    Example: media/posts/8f3a9b2d-5c4a-4a2a-ae4b-91d2f4b7a6e8.jpg
    """
    ext = filename.split(".")[-1]  # Get file extension (e.g., jpg, png)
    filename = f"{uuid.uuid4()}.{ext}"  # Generate a unique filename
    return os.path.join("posts", filename)


class Blog(BaseModel):
    slug = models.SlugField(unique=True)
    topic = models.ForeignKey(Topic, on_delete=models.PROTECT, related_name="blogs")
    image = models.ImageField(upload_to=blog_directory_path, max_length=500)
    published_at = models.DateField()
    author = models.ForeignKey(
        Instructor, on_delete=models.PROTECT, related_name="blogs"
    )
    tags = models.ManyToManyField(Tag, related_name="blogs")
    visits = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=False)

    class Meta:
        db_table = "blog"

    def increment_visits(self):
        """Increment visit count atomically."""
        self.visits = (
            models.F("visits") + 1
        )  # Increment visits field by 1 using F expressions
        self.save()

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return self.slug  # pragma: no cover


class BlogTranslation(BaseModel):
    blog = models.ForeignKey(
        Blog, on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    content = models.TextField()

    class Meta:
        db_table = "blog_translation"
        unique_together = ("blog", "language")
        verbose_name_plural = "Blog translations"

    def __str__(self):
        return f"{self.name} ({self.language})"  # pragma: no cover
