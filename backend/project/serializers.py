from rest_framework import serializers
from django.db.models import Case, When, Value, IntegerField
from .models import Project
from .stage.serializers import StageSerializer
from .level.serializers import LevelSerializer
from .category.serializers import CategorySerializer
from .technology.serializers import TechnologySerializer
from .tag.serializers import TagSerializer
from user.type.instructor_user.serializers import InstructorSerializer
from .progress.models import ProjectProgress
from blog.models import Blog
from plan.models import Plan
from review.models import Review
from const import UserType, PlanType
from global_config import CONFIG


class ProjectPrerequisiteSerializer(serializers.ModelSerializer):
    translated_name = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ["slug", "translated_name"]

    def get_translated_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name


class BlogPrerequisiteSerializer(serializers.ModelSerializer):
    translated_name = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = ["slug", "translated_name"]

    def get_translated_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ["type"]


class BaseProjectSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    language = serializers.CharField(write_only=True)

    translated_name = serializers.SerializerMethodField()
    translated_description = serializers.SerializerMethodField()
    level = LevelSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    technologies = TechnologySerializer(source="technology", many=True, read_only=True)
    instructors = InstructorSerializer(many=True, read_only=True)

    stages_count = serializers.IntegerField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    ratings_count = serializers.IntegerField(read_only=True)
    students_count = serializers.IntegerField(read_only=True)
    duration = serializers.IntegerField(read_only=True)

    plans = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "slug",
            "name",
            "language",
            "translated_name",
            "translated_description",
            "level",
            "category",
            "technologies",
            "instructors",
            "duration",
            "stages_count",
            "average_rating",
            "ratings_count",
            "students_count",
            "plans",
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
        # You could prefetch ProjectProgress for all steps if needed
        step_ids = []
        for stage in obj.stages.all():
            step_ids.extend(stage.steps.values_list("id", flat=True))

        total = len(step_ids)
        if total == 0:
            return 0

        completed = ProjectProgress.objects.filter(
            student__user=user, step_id__in=step_ids, completed_at__isnull=False
        ).count()

        return float((completed / total) * 100)

    def get_plans(self, obj):
        order_map = {
            plan_type.value: index for index, plan_type in enumerate(PlanType, start=1)
        }
        whens = [When(type=k, then=Value(v)) for k, v in order_map.items()]
        plans = obj.plans.order_by(Case(*whens, output_field=IntegerField()))
        return PlanSerializer(plans, many=True).data


class ProjectListSerializer(BaseProjectSerializer):
    pass


class ProjectRetrieveSerializer(BaseProjectSerializer):
    translated_overview = serializers.SerializerMethodField()

    points = serializers.IntegerField(read_only=True)
    reading_count = serializers.IntegerField(read_only=True)
    video_count = serializers.IntegerField(read_only=True)
    quiz_count = serializers.IntegerField(read_only=True)
    coding_count = serializers.IntegerField(read_only=True)

    stages = serializers.SerializerMethodField()
    project_prerequisites = serializers.SerializerMethodField()
    blog_prerequisites = serializers.SerializerMethodField()

    tags = TagSerializer(many=True, read_only=True)

    video_url = serializers.SerializerMethodField()

    class Meta(BaseProjectSerializer.Meta):
        fields = BaseProjectSerializer.Meta.fields + [
            "translated_overview",
            "video_url",
            "points",
            "reading_count",
            "video_count",
            "quiz_count",
            "coding_count",
            "stages",
            "project_prerequisites",
            "blog_prerequisites",
            "tags",
        ]

    def get_translated_overview(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).overview

    def get_stages(self, obj):
        return StageSerializer(
            obj.stages.all().filter(active=True), many=True, context=self.context
        ).data

    def get_project_prerequisites(self, obj):
        return ProjectPrerequisiteSerializer(
            obj.project_prerequisites.all().filter(active=True),
            many=True,
            context=self.context,
        ).data

    def get_blog_prerequisites(self, obj):
        return BlogPrerequisiteSerializer(
            obj.blog_prerequisites.all().filter(active=True),
            many=True,
            context=self.context,
        ).data

    def get_video_url(self, obj):
        request = self.context.get("request")
        if obj.video_url and hasattr(obj.video_url, "url") and request:
            if CONFIG["is_local"]:
                return f"http://localhost:8000{obj.video_url.url}"
            return request.build_absolute_uri(obj.video_url.url)
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)

        user = self.context["request"].user
        if not user.is_authenticated or user.user_type != UserType.STUDENT:
            return data

        review = Review.objects.filter(student__user=user, project=instance)

        data["reviewed"] = review.exists()

        return data
