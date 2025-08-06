import markdown
from django.db import models
from django.core.exceptions import ValidationError
from mdeditor import fields
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

    def __str__(self):  # pragma: no cover
        return self.slug


class StepTranslation(BaseModel):
    step = models.ForeignKey(
        "Step", on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField(max_length=255)
    text = fields.MDTextField()

    class Meta:
        db_table = "project_step_translation"
        verbose_name_plural = "Step translations"

    def clean(self):  # pragma: no cover
        try:
            markdown.markdown(self.text)
        except Exception as e:
            raise ValidationError({"content": f"Invalid Markdown: {str(e)}"})

    def __str__(self):  # pragma: no cover
        return f"{self.step.slug} ({self.language})"
