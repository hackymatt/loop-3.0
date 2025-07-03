from django.db import models
from core.base_model import BaseModel
from user.type.student_user.models import Student
from ..lesson.models import Lesson


class CourseProgress(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(null=True, blank=True)
    answer = models.JSONField(null=True, blank=True)
    points = models.PositiveIntegerField(default=0)
    hint_used = models.BooleanField(default=False)

    class Meta:
        db_table = "course_progress"
        unique_together = ("student", "lesson")

    def __str__(self):
        return f"{self.student.user} - {self.lesson}"  # pragma: no cover
