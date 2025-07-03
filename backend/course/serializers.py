from rest_framework import serializers
from .models import Course
from .chapter.serializers import ChapterSerializer
from .level.serializers import LevelSerializer
from .category.serializers import CategorySerializer
from .technology.serializers import TechnologySerializer
from user.type.instructor_user.serializers import InstructorSerializer
from .progress.models import CourseProgress
from review.models import Review
from const import UserType


class PrerequisiteSerializer(serializers.ModelSerializer):
    translated_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ["slug", "translated_name"]

    def get_translated_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name


class BaseCourseSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    language = serializers.CharField(write_only=True)

    translated_name = serializers.SerializerMethodField()
    translated_description = serializers.SerializerMethodField()
    level = LevelSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    technology = TechnologySerializer(read_only=True)
    instructors = InstructorSerializer(many=True, read_only=True)

    lessons_count = serializers.IntegerField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    ratings_count = serializers.IntegerField(read_only=True)
    students_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = [
            "slug",
            "name",
            "language",
            "translated_name",
            "translated_description",
            "level",
            "category",
            "technology",
            "instructors",
            "duration",
            "lessons_count",
            "average_rating",
            "ratings_count",
            "students_count",
        ]

    def get_translated_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name

    def get_translated_description(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).description

    def to_representation(self, instance):
        data = super().to_representation(instance)

        user = self.context["request"].user
        if not user.is_authenticated or user.user_type != UserType.STUDENT:
            return data

        data["progress"] = self.get_progress(instance, user)

        return data

    def get_progress(self, obj, user):
        # You could prefetch CourseProgress for all lessons if needed
        lesson_ids = []
        for chapter in obj.chapters.all():
            lesson_ids.extend(chapter.lessons.values_list("id", flat=True))

        total = len(lesson_ids)
        if total == 0:
            return 0

        completed = CourseProgress.objects.filter(
            student__user=user, lesson_id__in=lesson_ids, completed_at__isnull=False
        ).count()

        return float((completed / total) * 100)


class CourseListSerializer(BaseCourseSerializer):
    pass


class CourseRetrieveSerializer(BaseCourseSerializer):
    translated_overview = serializers.SerializerMethodField()

    points = serializers.IntegerField(read_only=True)
    reading_count = serializers.IntegerField(read_only=True)
    video_count = serializers.IntegerField(read_only=True)
    quiz_count = serializers.IntegerField(read_only=True)
    coding_count = serializers.IntegerField(read_only=True)

    chapters = ChapterSerializer(many=True, read_only=True)
    prerequisites = PrerequisiteSerializer(many=True, read_only=True)

    class Meta(BaseCourseSerializer.Meta):
        fields = BaseCourseSerializer.Meta.fields + [
            "translated_overview",
            "chat_url",
            "points",
            "reading_count",
            "video_count",
            "quiz_count",
            "coding_count",
            "chapters",
            "prerequisites",
        ]

    def get_translated_overview(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).overview

    def to_representation(self, instance):
        data = super().to_representation(instance)

        user = self.context["request"].user
        if not user.is_authenticated or user.user_type != UserType.STUDENT:
            return data

        review = Review.objects.filter(student__user=user, course=instance)

        data["reviewed"] = review.exists()

        return data
