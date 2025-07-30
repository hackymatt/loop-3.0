from rest_framework.mixins import RetrieveModelMixin
from rest_framework import status
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Step
from .serializers import StepBaseSerializer, StepDetailsSerializer
from ..enrollment.models import ProjectEnrollment
from ..progress.models import ProjectProgress
from ..models import Project
from ..stage.models import Stage
from ..step.models import Step
from plan.subscription.utils import get_subscription
from plan.utils import is_default_plan
from user.type.student_user.models import Student
from datetime import datetime


class StepViewSet(RetrieveModelMixin, GenericViewSet):
    queryset = Step.objects.all()
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        project_slug = kwargs.get("project_slug")
        stage_slug = kwargs.get("stage_slug")
        step_slug = kwargs.get("step_slug")

        student = Student.objects.get(user=request.user)
        project = get_object_or_404(Project, slug=project_slug, active=True)
        stage = get_object_or_404(Stage, slug=stage_slug, active=True)
        step = get_object_or_404(Step, slug=step_slug, active=True)

        if not project.stages.filter(id=stage.id).exists():
            return Response(
                {"root": "Stage not in this project."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not stage.steps.filter(id=step.id).exists():
            return Response(
                {"root": "Step not found in this project stage."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Plan check: limit access for free users
        if is_default_plan(get_subscription(student.user).plan):
            if (
                ProjectEnrollment.objects.filter(student=student)
                .exclude(project=project)
                .exists()
            ):
                serializer = StepBaseSerializer(step, context={"request": request})
                return Response(serializer.data, status=status.HTTP_403_FORBIDDEN)

        # Allow full access
        ProjectEnrollment.objects.get_or_create(student=student, project=project)
        ProjectProgress.objects.get_or_create(
            student=student,
            step=step,
            defaults={"completed_at": datetime.now()},
        )

        serializer = StepDetailsSerializer(step, context={"request": request})
        return Response(serializer.data)
