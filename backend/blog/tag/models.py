from django.db import models
from core.base_model import BaseModel
from const import Language


class Tag(BaseModel):
    slug = models.SlugField(unique=True)

    class Meta:
        db_table = "blog_tag"
        verbose_name_plural = "Tags"

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return self.slug  # pragma: no cover


class TagTranslation(BaseModel):
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name="translations")
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField()

    class Meta:
        db_table = "blog_tag_translation"
        verbose_name_plural = "Tag translations"
        unique_together = ("tag", "language")

    def __str__(self):
        return f"{self.tag.slug} ({self.language})"  # pragma: no cover
