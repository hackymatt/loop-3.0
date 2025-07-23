from django.db import models
from core.base_model import BaseModel
from const import Language


class Step(BaseModel):
    slug = models.SlugField(unique=True)
    points = models.PositiveIntegerField(default=0)
    duration = models.PositiveIntegerField()
    active = models.BooleanField(default=False)

    class Meta:
        db_table = "project_step"
        verbose_name_plural = "Steps"

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return self.slug  # pragma: no cover


class StepTranslation(BaseModel):
    step = models.ForeignKey(
        "Step", on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField(max_length=255)
    text = models.TextField()

    class Meta:
        db_table = "project_step_translation"
        verbose_name_plural = "Step translations"

    def __str__(self):
        return f"{self.step.slug} ({self.language})"  # pragma: no cover