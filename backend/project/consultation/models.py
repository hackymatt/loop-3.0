import uuid
import os
from django.db import models
from core.base_model import BaseModel
from ..models import Project
from user.type.student_user.models import Student
from const import ConsultationStatus


def consultation_directory_path(instance, filename):  # pragma: no cover
    """
    Generate a unique filename for the project's video.
    Example: media/projects/8f3a9b2d-5c4a-4a2a-ae4b-91d2f4b7a6e8.mp4
    """
    ext = filename.split(".")[-1]  # Get file extension (e.g., jpg, png)
    filename = f"{uuid.uuid4()}.{ext}"  # Generate a unique filename
    return os.path.join("consultations", filename)


class Consultation(BaseModel):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="consultations"
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="consultations"
    )
    comment = models.TextField()
    scheduled_at = models.DateTimeField(blank=True, null=True)
    status = models.CharField(
        max_length=9,
        choices=ConsultationStatus.choices,
        default=ConsultationStatus.REQUESTED,
    )
    join_link = models.URLField(blank=True, null=True)
    file = models.FileField(
        upload_to=consultation_directory_path, blank=True, null=True, max_length=500
    )

    class Meta:
        db_table = "consultation"
        verbose_name_plural = "Consultations"

    def __str__(self):  # pragma: no cover
        return f"Consultation {self.pk} for {self.student.user.first_name} {self.student.user.last_name} of {self.project.slug}"
