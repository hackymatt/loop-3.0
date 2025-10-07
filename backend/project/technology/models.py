from django.db import models
from core.base_model import BaseModel


class Technology(BaseModel):
    slug = models.SlugField(unique=True)
    name = models.CharField()

    class Meta:
        db_table = "project_technology"
        verbose_name_plural = "Technologies"
        indexes = [
            models.Index(fields=["name"]),
        ]

    def __str__(self):  # pragma: no cover
        return self.slug
