import os
import uuid
from django.db import models
from core.base_model import BaseModel
from const import Language
from .step.models import Step
from .level.models import Level
from .category.models import Category
from .technology.models import Technology
from blog.models import Blog
from user.type.instructor_user.models import Instructor

def project_directory_path(instance, filename):  # pragma: no cover
    """
    Generate a unique filename for the project's video.
    Example: media/projects/8f3a9b2d-5c4a-4a2a-ae4b-91d2f4b7a6e8.mp4
    """
    ext = filename.split(".")[-1]  # Get file extension (e.g., jpg, png)
    filename = f"{uuid.uuid4()}.{ext}"  # Generate a unique filename
    return os.path.join("projects", filename)


class Project(BaseModel):
    slug = models.SlugField(unique=True)
    level = models.ForeignKey(Level, on_delete=models.PROTECT)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    technology = models.ManyToManyField(Technology, related_name="projects", db_table="project_to_technology")
    steps = models.ManyToManyField(
        Step, through="ProjectStep", related_name="projects"
    )
    instructors = models.ManyToManyField(Instructor, related_name="projects")
    duration = models.PositiveIntegerField()
    chat_url = models.URLField()
    video_url = models.FileField(
        upload_to=project_directory_path, blank=True, null=True, max_length=500
    )
    project_prerequisites = models.ManyToManyField(
        "self", related_name="dependent_projects", blank=True, symmetrical=False
    )
    blog_prerequisites = models.ManyToManyField(
        Blog, related_name="dependent_blogs", blank=True, symmetrical=False
    )
    similar = models.ManyToManyField(
        "self", related_name="similar_projects", blank=True, symmetrical=False
    )
    active = models.BooleanField(default=False)

    class Meta:
        db_table = "project"

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return self.slug  # pragma: no cover


class ProjectTranslation(BaseModel):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    overview = models.TextField()

    class Meta:
        db_table = "project_translation"
        unique_together = ("project", "language")
        verbose_name_plural = "Project translations"

    def __str__(self):
        return f"{self.name} ({self.language})"  # pragma: no cover


class ProjectStep(models.Model):
    project = models.ForeignKey("project.Project", on_delete=models.CASCADE)
    step = models.ForeignKey(Step, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "project_step_mapping"
        unique_together = ("project", "step")
        ordering = ["order"]

    def __str__(self):
        return f"Project: {self.project.slug} | Step: {self.step.slug} | Order: {self.order}"  # pragma: no cover
