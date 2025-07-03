from django.db import models
from core.base_model import BaseModel
from const import Language
from ..lesson.models import Lesson


class Chapter(BaseModel):
    slug = models.SlugField(unique=True)
    lessons = models.ManyToManyField(
        Lesson, through="ChapterLesson", related_name="lessons"
    )
    active = models.BooleanField(default=False)

    class Meta:
        db_table = "course_chapter"

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return self.slug  # pragma: no cover


class ChapterTranslation(BaseModel):
    chapter = models.ForeignKey(
        Chapter, on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        db_table = "course_chapter_translation"
        unique_together = ("chapter", "language")
        verbose_name_plural = "Chapter translations"

    def __str__(self):
        return f"{self.name} ({self.language})"  # pragma: no cover


class ChapterLesson(models.Model):
    chapter = models.ForeignKey("chapter.Chapter", on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "chapter_lesson_mapping"
        unique_together = ("chapter", "lesson")
        ordering = ["order"]

    def __str__(self):
        return f"Chapter: {self.chapter.slug} | Lesson: {self.lesson.slug} | Order: {self.order}"  # pragma: no cover
