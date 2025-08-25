from django.db import models
from core.base_model import BaseModel
from const import Language, Currency, PaymentInterval
from global_config import CONFIG


class Plan(BaseModel):
    slug = models.SlugField(unique=True)
    popular = models.BooleanField(default=False)
    premium = models.BooleanField(default=False)
    tokens_limit = models.PositiveIntegerField(default=0)
    stripe_product_id = models.CharField(max_length=255, blank=True, null=True)

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def delete(self, *args, **kwargs):  # pragma: no cover
        if self.slug == CONFIG["default_plan"]:
            raise ValueError("You cannot delete the default plan.")
        super().delete(*args, **kwargs)

    def __str__(self):  # pragma: no cover
        return self.slug

    class Meta:
        db_table = "plan"


class PlanTranslation(BaseModel):
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

    def __str__(self):  # pragma: no cover
        return f"{self.plan.slug} ({self.language})"


class PlanPricing(BaseModel):
    plan = models.ForeignKey(Plan, related_name="pricings", on_delete=models.CASCADE)
    currency = models.CharField(
        max_length=3, choices=Currency.choices, default=Currency.PLN
    )
    interval = models.CharField(max_length=10, choices=PaymentInterval.choices)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_price_id = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        unique_together = ("plan", "currency", "interval")
        db_table = "plan_pricing"

    def __str__(self):  # pragma: no cover
        return f"{self.plan.slug} - {self.interval} - {self.price} {self.currency}"


class Option(BaseModel):
    slug = models.SlugField(unique=True)

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):  # pragma: no cover
        return self.slug

    class Meta:
        db_table = "option"


class OptionTranslation(BaseModel):
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

    def __str__(self):  # pragma: no cover
        return f"{self.option.slug} ({self.language})"


class PlanOption(BaseModel):
    plan = models.ForeignKey(
        Plan, related_name="plan_options", on_delete=models.CASCADE
    )
    option = models.ForeignKey(
        Option, related_name="plan_options", on_delete=models.CASCADE
    )
    disabled = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("plan", "option")
        db_table = "plan_option"
        ordering = ["order"]

    def __str__(self):  # pragma: no cover
        return f"{self.plan.slug} - {self.option.slug} (disabled: {self.disabled}) | Order: {self.order}"
