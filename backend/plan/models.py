from django.db import models
from const import Language
from global_config import CONFIG


class Plan(models.Model):
    slug = models.SlugField(unique=True)
    popular = models.BooleanField(default=False)
    premium = models.BooleanField(default=False)
    monthly_price = models.DecimalField(max_digits=6, decimal_places=2)
    yearly_price = models.DecimalField(max_digits=6, decimal_places=2)

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def delete(self, *args, **kwargs):  # pragma: no cover
        if self.slug == CONFIG["default_plan"]:
            raise ValueError("You cannot delete the default plan.")
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.slug  # pragma: no cover

    class Meta:
        db_table = "plan"


class PlanTranslation(models.Model):
    plan = models.ForeignKey(
        Plan, related_name="translations", on_delete=models.CASCADE
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    license = models.CharField(max_length=100)

    class Meta:
        unique_together = ("plan", "language")
        db_table = "plan_translation"

    def __str__(self):
        return f"{self.plan.slug} ({self.language})"  # pragma: no cover


class Option(models.Model):
    slug = models.SlugField(unique=True)

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return self.slug  # pragma: no cover

    class Meta:
        db_table = "option"


class OptionTranslation(models.Model):
    option = models.ForeignKey(
        Option, related_name="translations", on_delete=models.CASCADE
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    title = models.CharField(max_length=255)

    class Meta:
        unique_together = ("option", "language")
        db_table = "option_translation"

    def __str__(self):
        return f"{self.option.slug} ({self.language})"  # pragma: no cover


class PlanOption(models.Model):
    plan = models.ForeignKey(
        Plan, related_name="plan_options", on_delete=models.CASCADE
    )
    option = models.ForeignKey(
        Option, related_name="plan_options", on_delete=models.CASCADE
    )
    disabled = models.BooleanField(default=False)

    class Meta:
        unique_together = ("plan", "option")
        db_table = "plan_option"

    def __str__(self):
        return f"{self.plan.slug} - {self.option.slug} (disabled: {self.disabled})"  # pragma: no cover
