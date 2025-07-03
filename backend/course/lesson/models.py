from django.db import models
from core.base_model import BaseModel
from django.core.exceptions import ValidationError
from ..technology.models import Technology
from const import LessonType, QuizType, Language


class Lesson(BaseModel):
    slug = models.SlugField(unique=True)
    points = models.PositiveIntegerField(default=0)
    type = models.CharField(
        max_length=max(len(choice[0]) for choice in LessonType.choices),
        choices=LessonType.choices,
    )
    active = models.BooleanField(default=False)

    class Meta:
        db_table = "course_lesson"
        verbose_name_plural = "Lessons"

    def __str__(self):
        return self.slug  # pragma: no cover


class ReadingLesson(BaseModel):
    lesson = models.OneToOneField(
        "Lesson", on_delete=models.CASCADE, related_name="reading"
    )

    class Meta:
        db_table = "course_reading_lesson"
        verbose_name_plural = "Reading lessons"

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return f"Reading: {self.lesson.slug}"  # pragma: no cover

    def clean(self):
        if self.lesson.type != LessonType.READING:
            raise ValidationError(
                f"Reading can only be created for {LessonType.READING} lesson."
            )  # pragma: no cover

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class ReadingLessonTranslation(BaseModel):
    lesson = models.ForeignKey(
        "ReadingLesson", on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField(max_length=255)
    text = models.TextField()

    class Meta:
        db_table = "course_reading_lesson_translation"
        verbose_name_plural = "Reading lesson translations"

    def __str__(self):
        return f"{self.lesson.lesson.slug} ({self.language})"  # pragma: no cover


class VideoLesson(BaseModel):
    lesson = models.OneToOneField(
        "Lesson", on_delete=models.CASCADE, related_name="video"
    )
    video_url = models.URLField()

    class Meta:
        db_table = "course_video_lesson"
        verbose_name_plural = "Video lessons"

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return f"Video: {self.lesson.slug}"  # pragma: no cover

    def clean(self):
        if self.lesson.type != LessonType.VIDEO:
            raise ValidationError(
                f"Video can only be created for {LessonType.VIDEO} lesson."
            )  # pragma: no cover

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class VideoLessonTranslation(BaseModel):
    lesson = models.ForeignKey(
        "VideoLesson", on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField(max_length=255)

    class Meta:
        db_table = "course_video_lesson_translation"
        verbose_name_plural = "Video lesson translations"

    def __str__(self):
        return f"{self.lesson.lesson.slug} ({self.language})"  # pragma: no cover


class QuizLesson(BaseModel):
    lesson = models.OneToOneField(
        "Lesson", on_delete=models.CASCADE, related_name="quiz"
    )
    quiz_type = models.CharField(
        max_length=max(len(choice[0]) for choice in QuizType.choices),
        choices=QuizType.choices,
    )

    class Meta:
        db_table = "course_quiz_lesson"
        verbose_name_plural = "Quiz lessons"

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return f"Quiz: {self.lesson.slug}"  # pragma: no cover

    def clean(self):
        if self.lesson.type != LessonType.QUIZ:
            raise ValidationError(
                f"Quiz can only be created for {LessonType.QUIZ} lesson."
            )  # pragma: no cover

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class QuizLessonTranslation(BaseModel):
    lesson = models.ForeignKey(
        "QuizLesson", on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField(max_length=255)

    class Meta:
        db_table = "course_quiz_lesson_translation"
        verbose_name_plural = "Quiz lesson translations"

    def __str__(self):
        return f"{self.lesson.lesson.slug} ({self.language})"  # pragma: no cover


class QuizQuestion(BaseModel):
    translation = models.OneToOneField(
        "QuizLessonTranslation",
        on_delete=models.CASCADE,
        related_name="question",
    )
    text = models.TextField()

    class Meta:
        db_table = "course_quiz_question"
        verbose_name_plural = "Quiz questions"

    def __str__(self):
        return f"Question ({self.text}) - {self.translation}"  # pragma: no cover


class QuizQuestionOption(BaseModel):
    question = models.ForeignKey(
        "QuizQuestion", on_delete=models.CASCADE, related_name="options"
    )
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    class Meta:
        db_table = "course_quiz_question_option"
        verbose_name_plural = "Quiz question options"

    def __str__(self):
        return f"Option: {self.text}"  # pragma: no cover


class File(models.Model):
    name = models.CharField(max_length=255)
    path = models.CharField(max_length=500, null=True, blank=True)
    code = models.TextField()
    solution = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "course_file"
        verbose_name_plural = "Files"

    def __str__(self):
        return f"{f'{self.path}/{self.name}' if self.path else self.name} | Code: {(self.code[:100] + '...')}"  # pragma: no cover


class CodingLesson(BaseModel):
    lesson = models.OneToOneField(
        "Lesson", on_delete=models.CASCADE, related_name="coding"
    )
    technology = models.ForeignKey(Technology, on_delete=models.PROTECT)
    files = models.ManyToManyField(
        "File",
        related_name="coding_lessons",
        blank=True,
    )
    file = models.ForeignKey(
        "File",
        on_delete=models.PROTECT,
        related_name="starter_lessons",
        null=True,
        blank=True,
    )
    test_file = models.ForeignKey(
        "File",
        on_delete=models.PROTECT,
        related_name="tester_lessons",
        null=True,
        blank=True,
    )
    command = models.CharField(max_length=255)
    test_command = models.CharField(max_length=255, blank=True, null=True)
    timeout = models.PositiveIntegerField(default=10)
    penalty_points = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "course_coding_lesson"
        verbose_name_plural = "Coding lessons"

    def get_translation(self, lang_code):
        return self.translations.filter(language=lang_code).first()

    def __str__(self):
        return f"Coding: {self.lesson.slug}"  # pragma: no cover

    def clean(self):
        if self.lesson.type != LessonType.CODING:
            raise ValidationError(
                f"Coding can only be created for {LessonType.CODING} lesson."
            )  # pragma: no cover

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class CodingLessonTranslation(BaseModel):
    lesson = models.ForeignKey(
        "CodingLesson", on_delete=models.CASCADE, related_name="translations"
    )
    language = models.CharField(
        max_length=max(len(choice[0]) for choice in Language.choices),
        choices=Language.choices,
    )
    name = models.CharField(max_length=255)
    introduction = models.TextField()
    instructions = models.TextField()
    hint = models.TextField()

    class Meta:
        db_table = "course_coding_lesson_translation"
        verbose_name_plural = "Coding lesson translations"

    def __str__(self):
        return f"{self.lesson.lesson.slug} ({self.language})"  # pragma: no cover
