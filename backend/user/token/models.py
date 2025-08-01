from core.base_model import BaseModel
from django.db import models
from ..type.student_user.models import Student


class TokenUsage(BaseModel):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="tokens_usage"
    )
    endpoint = models.CharField(max_length=255, blank=True, null=True)
    tokens = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.student.user.email} - {self.tokens} tokens on {self.created_at}"  # pragma: no cover

    class Meta:
        db_table = "token_usage"
