from django.db import models
from core.base_model import BaseModel
from user.type.student_user.models import Student
from plan.models import PlanPricing
from global_config import CONFIG
from const import Currency


def get_dummy_student():  # pragma: no cover
    """Returns the dummy student instance."""
    return Student.objects.get(user__email=CONFIG["dummy_student_email"])


class PlanSubscription(BaseModel):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="subscriptions"
    )
    plan_pricing = models.ForeignKey(PlanPricing, on_delete=models.PROTECT)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):  # pragma: no cover
        return f"{self.student.user.email} - {self.plan.slug}"
