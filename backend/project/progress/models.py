from django.db import models
from core.base_model import BaseModel
from user.type.student_user.models import Student
from ..substep.models import Substep


class ProjectProgress(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    substep = models.ForeignKey(Substep, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "project_progress"
        unique_together = ("student", "substep")

    def __str__(self):
        return f"{self.student.user} - {self.substep}"  # pragma: no cover
