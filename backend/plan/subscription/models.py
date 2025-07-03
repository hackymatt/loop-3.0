from django.db import models
from user.type.student_user.models import Student
from plan.models import Plan
from global_config import CONFIG


def get_dummy_student():
    """Returns the dummy student instance."""
    return Student.objects.get(
        user__email=CONFIG["dummy_student_email"]
    )  # pragma: no cover


class PlanSubscription(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="subscriptions"
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.user.email} - {self.plan.slug}"  # pragma: no cover
