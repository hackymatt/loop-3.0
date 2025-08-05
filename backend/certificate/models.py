from django.db import models
from core.base_model import BaseModel
from user.type.student_user.models import Student
from project.models import Project
import uuid


class Certificate(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="certificates"
    )
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="certificates"
    )

    def __str__(self):  # pragma: no cover
        return f"Certificate for {self.student.user.first_name} {self.student.user.last_name} - {self.project.slug}"
