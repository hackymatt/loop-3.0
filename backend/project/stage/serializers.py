from rest_framework import serializers
from .models import Stage
from ..step.serializers import StepSerializer
from ..progress.models import ProjectProgress
from const import UserType


class StageSerializer(serializers.ModelSerializer):
    translated_name = serializers.SerializerMethodField()  # Used for output
    translated_description = serializers.SerializerMethodField()  # Used for output
    steps = serializers.SerializerMethodField()

    class Meta:
        model = Stage
        fields = ["slug", "translated_name", "translated_description", "steps"]

    def get_translated_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name

    def get_translated_description(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).description

    def get_steps(self, obj):
        return StepSerializer(
            obj.steps.all().order_by("stepstep__order"),
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
        step_ids = obj.steps.values_list("id", flat=True)
        total = len(step_ids)

        if total == 0:
            return 0

        completed = (
            ProjectProgress.objects.filter(
                student__user=user, step_id__in=step_ids, completed_at__isnull=False
            )
            .values("step_id")
            .distinct()
            .count()
        )

        return float((completed / total) * 100)
