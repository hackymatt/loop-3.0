from django.db import models
from core.base_model import BaseModel
from const import Language


class Level(BaseModel):
    slug = models.SlugField(unique=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "course_level"
        verbose_name_plural = "Levels"

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return self.slug  # pragma: no cover


class LevelTranslation(BaseModel):
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField()

    class Meta:
        db_table = "course_level_translation"
        unique_together = ("level", "language")

    def __str__(self):
        return f"{self.level.slug} ({self.language})"  # pragma: no cover
