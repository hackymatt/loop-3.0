from django.db import models
from core.base_model import BaseModel
from const import Language
from .chapter.models import Chapter
from .level.models import Level
from .category.models import Category
from .technology.models import Technology
from user.type.instructor_user.models import Instructor


class Course(BaseModel):
    slug = models.SlugField(unique=True)
    level = models.ForeignKey(Level, on_delete=models.PROTECT)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    technology = models.ForeignKey(Technology, on_delete=models.PROTECT)
    chapters = models.ManyToManyField(
        Chapter, through="CourseChapter", related_name="courses"
    )
    instructors = models.ManyToManyField(Instructor, related_name="courses")
    duration = models.PositiveIntegerField()
    chat_url = models.URLField()
    prerequisites = models.ManyToManyField(
        "self", related_name="dependent_courses", blank=True, symmetrical=False
    )
    active = models.BooleanField(default=False)

    class Meta:
        db_table = "course"

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return self.slug  # pragma: no cover


class CourseTranslation(BaseModel):
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    overview = models.TextField()

    class Meta:
        db_table = "course_translation"
        unique_together = ("course", "language")
        verbose_name_plural = "Course translations"

    def __str__(self):
        return f"{self.name} ({self.language})"  # pragma: no cover


class CourseChapter(models.Model):
    course = models.ForeignKey("course.Course", on_delete=models.CASCADE)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "course_chapter_mapping"
        unique_together = ("course", "chapter")
        ordering = ["order"]

    def __str__(self):
        return f"Course: {self.course.slug} | Chapter: {self.chapter.slug} | Order: {self.order}"  # pragma: no cover
