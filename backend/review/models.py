from django.db import models
from core.base_model import BaseModel
from django.core.validators import MinValueValidator, MaxValueValidator
from user.type.student_user.models import Student
from course.models import Course
from const import Language
from global_config import CONFIG


def get_dummy_student():
    """Returns the dummy student instance."""
    return Student.objects.get(
        user__email=CONFIG["dummy_student_email"]
    )  # pragma: no cover


class Review(BaseModel):
    student = models.ForeignKey(
        Student, on_delete=models.SET(get_dummy_student), related_name="reviews"
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="reviews")
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True, null=True)
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )

    def __str__(self):
        return f"{self.student.user.email} - {self.course.slug} ({self.rating}/5)"  # pragma: no cover

    class Meta:
        db_table = "review"
        unique_together = (
            "student",
            "course",
        )  # A student can review a course only once
