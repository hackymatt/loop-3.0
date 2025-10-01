from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from unittest.mock import patch
from rest_framework import status
from plan.subscription.utils import subscribe
from ...factory import (
    create_student,
    create_project,
    create_step,
    create_stage,
    create_plan,
    create_project_progress,
    create_project_enrollment,
)
from ...helpers import login, mock_send_request
from utils.openai.chat import OpenAIChat
from const import Urls, SubscriptionStatus, PlanType


class StepViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.STEP}"

        self.student, self.student_password = create_student(is_active=True)

        self.project = create_project(
            active=True, project_prerequisites=[], blog_prerequisites=[]
        )
        self.stage = self.project.stages.all()[0]

        self.step = create_step(active=True)
        self.stage.steps.add(self.step)
        self.stage.save()

        self.paid_plan = create_plan(type=PlanType.BASIC.value)

    def test_requires_authentication(self):
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:stage_slug>", self.step.slug)
            .replace("<slug:step_slug>", self.step.slug)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_successful_retrieve_step(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:stage_slug>", self.stage.slug)
            .replace("<slug:step_slug>", self.step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("points", response.data)
        self.assertIn("name", response.data)
        self.assertIn("text", response.data)

        # Ensure progress and enrollment were created
        self.assertTrue(
            ProjectEnrollment.objects.filter(
                student=self.student, project=self.project
            ).exists()
        )
        self.assertTrue(
            ProjectProgress.objects.filter(
                student=self.student, step=self.step
            ).exists()
        )

    def test_stage_not_in_project(self):
        login(self, self.student.user.email, self.student_password)

        other_stage = create_stage(active=True)

        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:stage_slug>", other_stage.slug)
            .replace("<slug:step_slug>", self.step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_step_not_in_step(self):
        login(self, self.student.user.email, self.student_password)

        other_step = create_step(active=True)

        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:stage_slug>", self.stage.slug)
            .replace("<slug:step_slug>", other_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_default_plan_first_project_allowed(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:stage_slug>", self.stage.slug)
            .replace("<slug:step_slug>", self.step.slug)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_default_plan_second_project_forbidden(self):
        login(self, self.student.user.email, self.student_password)

        create_project_enrollment(student=self.student, project=self.project)

        other_project = create_project(
            active=True, project_prerequisites=[], blog_prerequisites=[]
        )
        other_stage = other_project.stages.all()[0]
        other_step = other_stage.steps.all()[0]

        response = self.client.get(
            self.url.replace("<slug:project_slug>", other_project.slug)
            .replace("<slug:stage_slug>", other_stage.slug)
            .replace("<slug:step_slug>", other_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_paid_plan_second_project_allowed(self):
        login(self, self.student.user.email, self.student_password)
        subscribe(
            student=self.student,
            plan=self.paid_plan,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(years=1),
            status=SubscriptionStatus.ACTIVE,
        )

        create_project_enrollment(student=self.student, project=self.project)

        other_project = create_project(
            active=True, project_prerequisites=[], blog_prerequisites=[]
        )
        other_stage = other_project.stages.all()[0]
        other_step = other_stage.steps.all()[0]

        response = self.client.get(
            self.url.replace("<slug:project_slug>", other_project.slug)
            .replace("<slug:stage_slug>", other_stage.slug)
            .replace("<slug:step_slug>", other_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class StepChatViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.STEP_CHAT}"

        self.student, self.student_password = create_student(is_active=True)

        self.step = create_step(active=True)

    @patch.object(OpenAIChat, "_send_request")
    def test_chat_allowed(self, send_request_mock):
        login(self, self.student.user.email, self.student_password)
        mock_send_request(send_request_mock)

        subscription = self.student.current_subscription
        subscription.end_date = timezone.now() + timezone.timedelta(years=1)
        subscription.save()
        subscription.plan.tokens_limit = 9999
        subscription.plan.save()

        response = self.client.post(
            self.url.replace("<slug:step>", self.step.slug),
            {"messages": [{"role": "user", "text": "What's next?"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "text/event-stream")
        self.assertTrue(response.streaming)

        # Make sure streamed content is correct
        chunks = list(response.streaming_content)
        self.assertIn(b'data: {"text": "Hello"}\n\n', chunks)
        self.assertIn(b'data: {"text": "World"}\n\n', chunks)

    def test_chat_not_allowed(self):
        login(self, self.student.user.email, self.student_password)

        response = self.client.post(
            self.url.replace("<slug:step>", self.step.slug),
            {"messages": [{"role": "user", "text": "What's next?"}]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "text/event-stream")
        self.assertTrue(response.streaming)

        # Make sure streamed content is correct
        chunks = list(response.streaming_content)
        self.assertIn(
            b'data: {"text": "Token usage limit exceeded. Please upgrade your plan or wait until next period."}\n\n',
            chunks,
        )
