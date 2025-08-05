from rest_framework.mixins import RetrieveModelMixin
from rest_framework.renderers import BaseRenderer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from django.http import StreamingHttpResponse
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils.translation import get_language_from_request, gettext as _
from django.utils import timezone
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
from user.token.models import TokenUsage
from user.token.utils import is_user_within_token_limit, count_tokens
from utils.openai.chat import OpenAIChat
import json


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
            defaults={"completed_at": timezone.now()},
        )

        serializer = StepDetailsSerializer(step, context={"request": request})
        return Response(serializer.data)


class EventStreamRenderer(BaseRenderer):
    media_type = "text/event-stream"
    format = "event-stream"

    def render(self, data, media_type=None, renderer_context=None):  # pragma: no cover
        return data


class StepChatView(APIView):
    renderer_classes = [EventStreamRenderer]
    http_method_names = ["post"]
    permission_classes = [IsAuthenticated]
    open_ai_chat = OpenAIChat()

    def event_stream_error(self, content):
        def generate():
            yield "data: {}\n\n".format(json.dumps({"text": content}))

        return generate()

    def post(self, request, step):
        is_allowed = is_user_within_token_limit(request.user)

        if not is_allowed:
            return StreamingHttpResponse(
                streaming_content=self.event_stream_error(
                    _(
                        "Token usage limit exceeded. Please upgrade your plan or wait until next period."
                    )
                ),
                status=status.HTTP_200_OK,
                content_type="text/event-stream",
            )

        body = request.data
        language = get_language_from_request(request)

        step = get_object_or_404(Step, slug=step, active=True)
        text = step.get_translation(language).text

        text = _(
            "You are assisting with a programming project step. Only respond based on the specific context provided by the user. Do not answer anything beyond the scope of the current step. If the user asks something unrelated or beyond this step, politely remind them that you're limited to this step only. Respond in English. This is step content: %(text)s"
        ) % {"text": text}
        system_message = {"role": "system", "text": text}

        user_messages = body.get("messages", [])
        messages = [system_message, *user_messages]
        model = "gpt-3.5-turbo"

        body = self.open_ai_chat.create_chat_body(
            {"messages": messages, "model": model}
        )

        tokens_count = count_tokens(body["messages"], body["model"])

        data = self.open_ai_chat.chat(body)

        TokenUsage.objects.create(
            student=Student.objects.get(user=request.user),
            endpoint=request.get_full_path(),
            tokens=tokens_count,
        )

        return StreamingHttpResponse(
            streaming_content=data,
            status=status.HTTP_200_OK,
            content_type="text/event-stream",
        )
