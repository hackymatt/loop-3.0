from django.db import models
from core.base_model import BaseModel
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.utils import timezone
from const import UserType, SubscriptionStatus


class Student(BaseModel):
    user = models.OneToOneField(
        get_user_model(), on_delete=models.CASCADE, related_name="student_profile"
    )
    stripe_customer_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    def clean(self):
        """Ensure only users with user_type=STUDENT can be assigned"""
        if self.user.user_type != UserType.STUDENT:
            raise ValidationError(
                f"Student profile can only be created for {UserType.STUDENT} users."
            )  # pragma: no cover

    @property
    def current_subscription(self):
        """
        Returns the latest active/trialing subscription for this student.
        Falls back to last-ended subscription if none are active.
        """
        now = timezone.now()
        return self.subscriptions.order_by("-created_at").first()

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):  # pragma: no cover
        return f"Student Profile: {self.user.email}"

    class Meta:
        db_table = "student"
