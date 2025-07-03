from django.db import models
from core.base_model import BaseModel
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from const import UserType


class Instructor(BaseModel):
    user = models.OneToOneField(
        get_user_model(), on_delete=models.CASCADE, related_name="instructor_profile"
    )
    role = models.CharField(max_length=255)

    def clean(self):
        """Ensure only users with user_type=INSTRUCTOR can be assigned"""
        if self.user.user_type != UserType.INSTRUCTOR:
            raise ValidationError(
                f"Instructor profile can only be created for {UserType.INSTRUCTOR} users."
            )  # pragma: no cover

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Instructor Profile: {self.user.email}"  # pragma: no cover

    class Meta:
        db_table = "instructor"
