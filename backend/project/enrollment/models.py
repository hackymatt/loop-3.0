from django.db import models
from core.base_model import BaseModel
from user.type.student_user.models import Student
from ..models import Project
from global_config import CONFIG


def get_dummy_student():  # pragma: no cover
    """Returns the dummy student instance."""
    return Student.objects.get(user__email=CONFIG["dummy_student_email"])


class ProjectEnrollment(BaseModel):
    student = models.ForeignKey(
        Student, on_delete=models.SET(get_dummy_student), related_name="enrollments"
    )
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="enrollments"
    )

    class Meta:
        db_table = "project_enrollment"
        unique_together = (
            "student",
            "project",
        )  # Ensures that a student can only enroll in a project once
        indexes = [
            models.Index(fields=["student", "-created_at"]),
        ]

    def __str__(self):  # pragma: no cover
        return f"{self.student.user.email} started {self.project.slug} on {self.created_at}"
