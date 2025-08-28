from django.db import models
from django.utils import timezone
from core.base_model import BaseModel
from user.type.student_user.models import Student
from plan.models import Plan, PlanPricing
from const import SubscriptionStatus


class PlanSubscription(BaseModel):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="subscriptions"
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    plan_pricing = models.ForeignKey(
        PlanPricing, on_delete=models.PROTECT, null=True, blank=True
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.INCOMPLETE,
    )
    auto_renew = models.BooleanField(null=True)
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

    @property
    def is_active(self):
        """True if subscription is active and not expired."""
        return self.status == SubscriptionStatus.ACTIVE and (
            self.end_date is None or self.end_date > timezone.now()
        )

    @property
    def is_trialing(self):
        """True if in trial and not expired."""
        return self.status == SubscriptionStatus.TRIALING and (
            self.end_date is None or self.end_date > timezone.now()
        )

    @property
    def is_to_be_cancelled(self):
        """True if auto-renew is off but plan is still active."""
        return self.is_active and not self.auto_renew

    @property
    def next_billing_date(self):
        """
        Next billing date is the end date of the current billing period
        if it's a paid plan. For free/lifetime plans, this can be None.
        """
        return self.end_date
