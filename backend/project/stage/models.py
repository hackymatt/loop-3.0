from django.db import models
from core.base_model import BaseModel
from const import Language
from ..step.models import Step


class Stage(BaseModel):
    slug = models.SlugField(unique=True)
    steps = models.ManyToManyField(Step, through="StageStep", related_name="steps")
    active = models.BooleanField(default=False)

    class Meta:
        db_table = "project_stage"
        indexes = [
            models.Index(fields=["active"]),  # speeds up filtering by active
        ]

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):  # pragma: no cover
        return self.slug


class StageTranslation(BaseModel):
    stage = models.ForeignKey(
        Stage, on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        db_table = "project_stage_translation"
        unique_together = ("stage", "language")
        verbose_name_plural = "Stage translations"
        indexes = [
            models.Index(fields=["language"]),
        ]

    def __str__(self):  # pragma: no cover
        return f"{self.name} ({self.language})"


class StageStep(BaseModel):
    stage = models.ForeignKey("stage.Stage", on_delete=models.CASCADE)
    step = models.ForeignKey(Step, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "stage_step_mapping"
        unique_together = ("stage", "step")
        ordering = ["order"]
        indexes = [
            models.Index(fields=["stage", "step"]),
            models.Index(fields=["step", "stage"]),
        ]

    def __str__(self):  # pragma: no cover
        return (
            f"Stage: {self.stage.slug} | Step: {self.step.slug} | Order: {self.order}"
        )
