from django.db import models
from core.base_model import BaseModel
from const import Language


class Category(BaseModel):
    slug = models.SlugField(unique=True)

    class Meta:
        db_table = "project_category"
        verbose_name_plural = "Categories"

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):  # pragma: no cover
        return self.slug


class CategoryTranslation(BaseModel):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField()

    class Meta:
        db_table = "project_category_translation"
        verbose_name_plural = "Category translations"
        unique_together = ("category", "language")
        indexes = [
            models.Index(fields=["language"]),
        ]

    def __str__(self):  # pragma: no cover
        return f"{self.category.slug} ({self.language})"
