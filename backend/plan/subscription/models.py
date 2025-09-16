from django.db import models
from core.base_model import BaseModel
from user.type.student_user.models import Student
from plan.models import Plan, PlanPricing
from const import SubscriptionStatus


class PlanSubscription(BaseModel):
    student = models.OneToOneField(
        Student, on_delete=models.CASCADE, related_name="subscription"
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    plan_pricing = models.ForeignKey(
        PlanPricing, on_delete=models.PROTECT, null=True, blank=True
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(blank=True, null=True)
    amount_due = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.INCOMPLETE,
    )
    cancel_at_period_end = models.BooleanField(null=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):  # pragma: no cover
        pricing_str = (
            f"{self.plan_pricing.interval} - {self.plan_pricing.price} {self.plan_pricing.currency}"
            if self.plan_pricing
            else "No pricing"
        )
        return f"{self.student.user.email} - {self.plan.type} - {pricing_str}"

    class Meta:
        db_table = "plan_subscription"
