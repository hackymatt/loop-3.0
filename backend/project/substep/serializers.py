from rest_framework import serializers
from django.utils.translation import gettext as _
from .models import Substep
from ..progress.models import ProjectProgress
from const import UserType


class SubstepSerializer(serializers.ModelSerializer):
    translated_name = serializers.SerializerMethodField()  # Used for output

    class Meta:
        model = Substep
        fields = ["slug", "translated_name", "points"]

    def get_translated_name(self, obj):
        """Retrieve the translated name based on request language"""
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name

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
        is_completed = ProjectProgress.objects.filter(
            student__user=user, substep=obj, completed_at__isnull=False
        ).exists()

        return 100 if is_completed else 0

    def get_points(self, obj, user):
        return (
            ProjectProgress.objects.filter(
                student__user=user, substep=obj, completed_at__isnull=False
            )
            .first()
            .points
        )


class SubstepBaseSerializer(serializers.ModelSerializer):
    points = serializers.CharField(source="substep.points")
    name = serializers.SerializerMethodField()

    class Meta:
        model = Substep
        fields = ["points", "name"]

    def get_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).name


class SubstepDetailsSerializer(SubstepBaseSerializer):
    text = serializers.SerializerMethodField()

    class Meta(SubstepBaseSerializer.Meta):
        fields = SubstepBaseSerializer.Meta.fields + ["text"]

    def get_text(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.get_translation(lang).text


