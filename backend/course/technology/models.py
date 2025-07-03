from django.db import models
from core.base_model import BaseModel


class Technology(BaseModel):
    slug = models.SlugField(unique=True)
    name = models.CharField()

    class Meta:
        db_table = "course_technology"
        verbose_name_plural = "Technologies"

    def __str__(self):
        return self.slug  # pragma: no cover
