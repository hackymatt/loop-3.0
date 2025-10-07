from django.db import models
from django.utils import timezone
from core.base_model import BaseModel
from const import PlanType, Language, Currency, PaymentInterval
from global_config import CONFIG


class Plan(BaseModel):
    type = models.CharField(max_length=10, choices=PlanType.choices)
    popular = models.BooleanField(default=False)
    tokens_limit = models.PositiveIntegerField(default=0)
    consultation_limit = models.PositiveIntegerField(default=0)
    stripe_product_id = models.CharField(max_length=255, blank=True, null=True)

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def get_pricings(self):
        return self.pricings.all()

    def delete(self, *args, **kwargs):  # pragma: no cover
        if self.type == CONFIG["default_plan"]:
            raise ValueError("You cannot delete the default plan.")
        super().delete(*args, **kwargs)

    def __str__(self):  # pragma: no cover
        return self.type

    @property
    def is_free(plan):
        return plan.type == PlanType.FREE

    @property
    def is_premium(plan):
        return plan.type == PlanType.PREMIUM

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
        indexes = [
            models.Index(fields=["language"]),
        ]

    def __str__(self):  # pragma: no cover
        return f"{self.plan.type} ({self.language})"


class PlanPricing(BaseModel):
    plan = models.ForeignKey(Plan, related_name="pricings", on_delete=models.CASCADE)
    currency = models.CharField(
        max_length=3, choices=Currency.choices, default=Currency.PLN
    )
    interval = models.CharField(max_length=10, choices=PaymentInterval.choices)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_price_id = models.CharField(max_length=255, blank=True, null=True)
    valid_from = models.DateTimeField()

    class Meta:
        unique_together = ("plan", "currency", "interval", "valid_from")
        db_table = "plan_pricing"
        indexes = [
            models.Index(fields=["stripe_price_id"]),
            models.Index(fields=["plan", "currency", "interval", "-valid_from"]),
        ]

    def __str__(self):  # pragma: no cover
        return f"{self.plan.type} - {self.interval} - {self.price} {self.currency}, since: {self.valid_from}"

    @classmethod
    def get_current_price(cls, plan, currency, interval):
        """Get active price for a given plan, currency, and interval."""
        return (
            cls.objects.filter(
                plan=plan,
                currency=currency,
                interval=interval,
                valid_from__lte=timezone.now(),
            )
            .order_by("-valid_from")
            .first()
        )


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
        indexes = [
            models.Index(fields=["language"]),
        ]

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
        indexes = [
            models.Index(fields=["plan", "order"]),
            models.Index(fields=["order"]),
        ]

    def __str__(self):  # pragma: no cover
        return f"{self.plan.type} - {self.option.slug} (disabled: {self.disabled}) | Order: {self.order}"
