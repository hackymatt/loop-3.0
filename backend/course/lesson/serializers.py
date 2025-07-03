import ast
import math
import re
import markdown
import requests
from bs4 import BeautifulSoup
from rest_framework import serializers
from django.utils.translation import gettext as _
from .models import (
    Lesson,
    ReadingLesson,
    ReadingLessonTranslation,
    VideoLesson,
    VideoLessonTranslation,
    QuizLesson,
    QuizLessonTranslation,
    QuizQuestion,
    QuizQuestionOption,
    File,
    CodingLesson,
    CodingLessonTranslation,
)
from ..progress.models import CourseProgress
from const import LessonType, UserType
from global_config import CONFIG
from utils.logger.logger import logger


class LessonSerializer(serializers.ModelSerializer):
    translated_name = serializers.SerializerMethodField()  # Used for output

    class Meta:
        model = Lesson
        fields = ["slug", "translated_name", "points", "type"]

    def get_translated_name(self, obj):
        """Retrieve the translated name based on request language"""
        lang = self.context.get("request").LANGUAGE_CODE
        if obj.type == LessonType.READING:
            translation = ReadingLessonTranslation.objects.filter(
                lesson=obj.reading, language=lang
            ).first()
        elif obj.type == LessonType.VIDEO:
            translation = VideoLessonTranslation.objects.filter(
                lesson=obj.video, language=lang
            ).first()
        elif obj.type == LessonType.QUIZ:
            translation = QuizLessonTranslation.objects.filter(
                lesson=obj.quiz, language=lang
            ).first()
        else:
            translation = CodingLessonTranslation.objects.filter(
                lesson=obj.coding, language=lang
            ).first()
        return translation.name

    def to_representation(self, instance):
        data = super().to_representation(instance)

        user = self.context["request"].user
        if not user.is_authenticated or user.user_type != UserType.STUDENT:
            return data

        progress = self.get_progress(instance, user)
        data["progress"] = progress
        data["earned_points"] = (
            self.get_points(instance, user) if progress == 100 else None
        )

        return data

    def get_progress(self, obj, user):
        is_completed = CourseProgress.objects.filter(
            student__user=user, lesson=obj, completed_at__isnull=False
        ).exists()

        return 100 if is_completed else 0

    def get_points(self, obj, user):
        return (
            CourseProgress.objects.filter(
                student__user=user, lesson=obj, completed_at__isnull=False
            )
            .first()
            .points
        )


class ReadingLessonBaseSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="lesson.type")
    points = serializers.CharField(source="lesson.points")
    name = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()

    class Meta:
        model = ReadingLesson
        fields = ["type", "points", "name", "duration"]

    def get_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name

    def _get_text(self, obj):  # Internal method to avoid name conflict
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).text

    def get_duration(self, obj):
        content = self._get_text(obj)
        html = markdown.markdown(content)
        soup = BeautifulSoup(html, features="html.parser")
        plain_text = soup.get_text()
        words = re.findall(r"\w+", plain_text)
        return math.ceil(len(words) / CONFIG["words_per_minute"])


class ReadingLessonSerializer(ReadingLessonBaseSerializer):
    text = serializers.SerializerMethodField()

    class Meta(ReadingLessonBaseSerializer.Meta):
        fields = ReadingLessonBaseSerializer.Meta.fields + ["text"]

    def get_text(self, obj):
        return self._get_text(obj)


class VideoLessonBaseSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="lesson.type")
    points = serializers.CharField(source="lesson.points")
    name = serializers.SerializerMethodField()

    class Meta:
        model = VideoLesson
        fields = ["type", "points", "name"]

    def get_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name


class VideoLessonSerializer(VideoLessonBaseSerializer):
    video_url = serializers.URLField()

    class Meta(VideoLessonBaseSerializer.Meta):
        fields = VideoLessonBaseSerializer.Meta.fields + ["video_url"]


class QuizQuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestionOption
        fields = ["text"]


class QuizQuestionSerializer(serializers.ModelSerializer):
    options = QuizQuestionOptionSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = ["text", "options"]


class QuizLessonBaseSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="lesson.type")
    points = serializers.CharField(source="lesson.points")
    name = serializers.SerializerMethodField()

    class Meta:
        model = QuizLesson
        fields = ["type", "points", "name", "quiz_type"]

    def get_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name


class QuizLessonSerializer(QuizLessonBaseSerializer):
    question = serializers.SerializerMethodField()

    class Meta(QuizLessonBaseSerializer.Meta):
        fields = QuizLessonBaseSerializer.Meta.fields + ["question"]

    def get_question(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        question = obj.get_translation(lang).question
        return QuizQuestionSerializer(question).data

    def to_representation(self, instance):
        data = super().to_representation(instance)

        user = self.context["request"].user
        progress = CourseProgress.objects.filter(
            student__user=user, lesson=instance.lesson
        )
        data["answer"] = progress.first().answer

        return data


class CodingLessonBaseSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="lesson.type")
    points = serializers.CharField(source="lesson.points")
    name = serializers.SerializerMethodField()

    class Meta:
        model = CodingLesson
        fields = [
            "type",
            "points",
            "name",
        ]

    def get_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name


class FileBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ["name", "path"]


class FileSerializer(FileBaseSerializer):
    code = serializers.CharField(source="solution")

    class Meta(FileBaseSerializer.Meta):
        fields = FileBaseSerializer.Meta.fields + ["code"]


class StarterFileSerializer(FileBaseSerializer):
    class Meta(FileBaseSerializer.Meta):
        fields = FileBaseSerializer.Meta.fields + ["code"]


class TestFileSerializer(FileBaseSerializer):
    class Meta(FileBaseSerializer.Meta):
        fields = FileBaseSerializer.Meta.fields + ["code"]


class CodingLessonSerializer(CodingLessonBaseSerializer):
    technology = serializers.CharField(source="technology.slug", read_only=True)
    file = StarterFileSerializer(read_only=True)
    files = FileSerializer(many=True, read_only=True)
    penalty_points = serializers.IntegerField(read_only=True)
    introduction = serializers.SerializerMethodField()
    instructions = serializers.SerializerMethodField()

    class Meta(CodingLessonBaseSerializer.Meta):
        fields = CodingLessonBaseSerializer.Meta.fields + [
            "timeout",
            "command",
            "technology",
            "file",
            "files",
            "penalty_points",
            "introduction",
            "instructions",
        ]

    def get_introduction(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).introduction

    def get_instructions(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).instructions

    def to_representation(self, instance):
        lang = self.context.get("request").LANGUAGE_CODE
        data = super().to_representation(instance)

        request = self.context["request"]
        user = request.user

        progress = CourseProgress.objects.filter(
            student__user=user,
            lesson=instance.lesson,
        ).first()

        if progress.hint_used:
            data["hint"] = instance.get_translation(lang).hint

        data["answer"] = progress.answer

        return data


class QuizLessonSubmitSerializer(serializers.Serializer):
    answer = serializers.ListField(child=serializers.JSONField(), allow_empty=False)

    def validate(self, attrs):
        lang = self.context.get("request").LANGUAGE_CODE
        lesson = self.context.get("lesson")
        answer = attrs["answer"]

        question = lesson.get_translation(lang).question
        correct = [option.is_correct for option in question.options.all()]

        if answer != correct:
            raise serializers.ValidationError(
                {
                    "answer": [
                        _("Almost there! Review your answers and give it another shot.")
                    ]
                }
            )

        return attrs


class CodingLessonSubmitSerializer(serializers.Serializer):
    answer = serializers.CharField()

    def _strings_are_equivalent(self, code1: str, code2: str) -> bool:
        return code1.strip() == code2.strip()

    def _codes_are_equivalent(self, code1: str, code2: str) -> bool:
        try:
            tree1 = ast.parse(code1.strip())
            tree2 = ast.parse(code2.strip())
            return ast.dump(tree1) == ast.dump(tree2)
        except SyntaxError:
            return False

    def _run_tests(self, user_id: str, lesson: CodingLesson, answer: str, lang: str):
        file = {**FileSerializer(lesson.file).data, "code": answer}
        test_file = TestFileSerializer(lesson.test_file).data
        files = [
            dict(item) for item in FileSerializer(lesson.files.all(), many=True).data
        ]
        payload = {
            "user_id": str(user_id),
            "technology": lesson.technology.slug,
            "timeout": lesson.timeout,
            "files": [file, test_file, *files],
            "command": lesson.test_command,
            "language": lang,
        }
        try:
            response = requests.post(
                url=f"{CONFIG['broker_url']}/api/test", json=payload
            )
            response.raise_for_status()
            data = response.json()
            return data["result"]
        except Exception as e:
            logger.error(f"Could not get broker response: {e}")
            return {
                "stdout": "",
                "stderr": _("Almost there! Check your code and give it another shot."),
                "exit_code": 1,
            }

    def validate(self, attrs):
        lesson = self.context.get("lesson")
        answer = attrs["answer"]

        correct = lesson.file
        run_test = lesson.test_command is not None and lesson.test_file is not None

        if not (
            self._strings_are_equivalent(answer, correct.solution)
            or self._codes_are_equivalent(answer, correct.solution)
        ):
            if run_test:
                user_id = self.context.get("request").user.id
                lang = self.context.get("request").LANGUAGE_CODE
                result = self._run_tests(user_id, lesson, answer, lang)
                if result["exit_code"] != 0:
                    raise serializers.ValidationError(
                        {"answer": result["stdout"] + result["stderr"]}
                    )
            else:
                raise serializers.ValidationError(
                    {
                        "answer": _(
                            "Almost there! Check your code and give it another shot."
                        )
                    }
                )

        return attrs
