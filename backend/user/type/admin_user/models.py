from django.db import models
from core.base_model import BaseModel
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from const import UserType


class Admin(BaseModel):
    user = models.OneToOneField(
        get_user_model(), on_delete=models.CASCADE, related_name="admin_profile"
    )

    def clean(self):
        """Ensure only users with user_type=ADMIN can be assigned"""
        if self.user.user_type != UserType.ADMIN:
            raise ValidationError(
                f"Admin profile can only be created for {UserType.ADMIN} users."
            )  # pragma: no cover

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Admin Profile: {self.user.email}"  # pragma: no cover

    class Meta:
        db_table = "admin"
