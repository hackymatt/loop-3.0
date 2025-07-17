from django.db import models
from core.base_model import BaseModel
from const import Language
from ..substep.models import Substep


class Step(BaseModel):
    slug = models.SlugField(unique=True)
    substeps = models.ManyToManyField(
        Substep, through="StepSubstep", related_name="substeps"
    )
    active = models.BooleanField(default=False)

    class Meta:
        db_table = "project_step"

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return self.slug  # pragma: no cover


class StepTranslation(BaseModel):
    step = models.ForeignKey(
        Step, on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        db_table = "project_step_translation"
        unique_together = ("step", "language")
        verbose_name_plural = "Step translations"

    def __str__(self):
        return f"{self.name} ({self.language})"  # pragma: no cover


class StepSubstep(models.Model):
    step = models.ForeignKey("step.Step", on_delete=models.CASCADE)
    substep = models.ForeignKey(Substep, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "step_substep_mapping"
        unique_together = ("step", "substep")
        ordering = ["order"]

    def __str__(self):
        return f"Step: {self.step.slug} | Substep: {self.substep.slug} | Order: {self.order}"  # pragma: no cover
