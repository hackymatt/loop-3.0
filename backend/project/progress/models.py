from django.db import models
from core.base_model import BaseModel
from user.type.student_user.models import Student
from ..step.models import Step


class ProjectProgress(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    step = models.ForeignKey(Step, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "project_progress"
        unique_together = ("student", "step")
        indexes = [
            models.Index(
                fields=["student", "step"],
                name="projectprogress_completed_idx",
                condition=models.Q(completed_at__isnull=False),
            ),
        ]

    def __str__(self):  # pragma: no cover
        return f"{self.student.user} - {self.step}"
