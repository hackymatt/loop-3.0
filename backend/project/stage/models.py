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

    def __str__(self):  # pragma: no cover
        return f"{self.name} ({self.language})"


class StageStep(models.Model):
    stage = models.ForeignKey("stage.Stage", on_delete=models.CASCADE)
    step = models.ForeignKey(Step, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "stage_step_mapping"
        unique_together = ("stage", "step")
        ordering = ["order"]

    def __str__(self):  # pragma: no cover
        return (
            f"Stage: {self.stage.slug} | Step: {self.step.slug} | Order: {self.order}"
        )
