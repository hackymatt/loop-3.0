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

    def __str__(self):
        return f"{self.student.user} - {self.step}"  # pragma: no cover
