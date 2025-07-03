from rest_framework import serializers
from .models import Chapter
from ..lesson.serializers import LessonSerializer
from ..progress.models import CourseProgress
from const import UserType


class ChapterSerializer(serializers.ModelSerializer):
    translated_name = serializers.SerializerMethodField()  # Used for output
    translated_description = serializers.SerializerMethodField()  # Used for output
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = ["slug", "translated_name", "translated_description", "lessons"]

    def get_translated_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name

    def get_translated_description(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).description

    def get_lessons(self, obj):
        return LessonSerializer(
            obj.lessons.all().order_by("chapterlesson__order"),
            many=True,
            context=self.context,
        ).data

    def to_representation(self, instance):
        data = super().to_representation(instance)

        user = self.context["request"].user
        if not user.is_authenticated or user.user_type != UserType.STUDENT:
            return data

        data["progress"] = self.get_progress(instance, user)

        return data

    def get_progress(self, obj, user):
        lesson_ids = obj.lessons.values_list("id", flat=True)
        total = len(lesson_ids)

        if total == 0:
            return 0

        completed = (
            CourseProgress.objects.filter(
                student__user=user, lesson_id__in=lesson_ids, completed_at__isnull=False
            )
            .values("lesson_id")
            .distinct()
            .count()
        )

        return float((completed / total) * 100)
