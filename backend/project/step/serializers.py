from rest_framework import serializers
from .models import Step
from ..substep.serializers import SubstepSerializer
from ..progress.models import ProjectProgress
from const import UserType


class StepSerializer(serializers.ModelSerializer):
    translated_name = serializers.SerializerMethodField()  # Used for output
    translated_description = serializers.SerializerMethodField()  # Used for output
    substeps = serializers.SerializerMethodField()

    class Meta:
        model = Step
        fields = ["slug", "translated_name", "translated_description", "substeps"]

    def get_translated_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name

    def get_translated_description(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).description

    def get_substeps(self, obj):
        return SubstepSerializer(
            obj.substeps.all().order_by("stepsubstep__order"),
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
        substep_ids = obj.substeps.values_list("id", flat=True)
        total = len(substep_ids)

        if total == 0:
            return 0

        completed = (
            ProjectProgress.objects.filter(
                student__user=user, substep_id__in=substep_ids, completed_at__isnull=False
            )
            .values("substep_id")
            .distinct()
            .count()
        )

        return float((completed / total) * 100)
