from django.db import models
from core.base_model import BaseModel
from const import Language


class Level(BaseModel):
    slug = models.SlugField(unique=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "project_level"
        verbose_name_plural = "Levels"
        indexes = [
            models.Index(fields=["order"]),
        ]

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):  # pragma: no cover
        return self.slug


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
        db_table = "project_level_translation"
        unique_together = ("level", "language")
        indexes = [
            models.Index(fields=["language"]),
        ]

    def __str__(self):  # pragma: no cover
        return f"{self.level.slug} ({self.language})"
