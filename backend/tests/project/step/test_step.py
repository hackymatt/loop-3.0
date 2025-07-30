from django.test import TestCase
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from rest_framework.test import APIClient
from rest_framework import status
from project.enrollment.models import ProjectEnrollment
from project.progress.models import ProjectProgress
from plan.subscription.utils import subscribe
from ...factory import (
    create_student,
    create_project,
    create_step,
    create_stage,
    create_plan,
)
from ...helpers import login
from const import Urls, Currency


class StepViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.STEP}"

        self.student, self.student_password = create_student()

        self.project = create_project()
        self.stage = self.project.stages.all()[0]

        self.step = create_step()
        self.stage.steps.add(self.step)
        self.stage.save()

        self.paid_plan = create_plan()

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

        other_stage = create_stage()

        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:stage_slug>", other_stage.slug)
            .replace("<slug:step_slug>", self.step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_step_not_in_step(self):
        login(self, self.student.user.email, self.student_password)

        other_step = create_step()

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

        ProjectEnrollment.objects.create(student=self.student, project=self.project)

        other_project = create_project()
        other_stage = other_project.stages.all()[0]
        other_step = other_stage.steps.all()[0]

        response = self.client.get(
            self.url.replace("<slug:project_slug>", other_project.slug)
            .replace("<slug:stage_slug>", other_stage.slug)
            .replace("<slug:step_slug>", other_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_paid_plan_second_step_allowed(self):
        login(self, self.student.user.email, self.student_password)
        subscribe(
            student=self.student,
            plan=self.paid_plan,
            end_date=timezone.now() + relativedelta(years=1),
            currency=Currency.PLN,
        )

        ProjectEnrollment.objects.create(student=self.student, project=self.project)

        other_project = create_project()
        other_stage = other_project.stages.all()[0]
        other_step = other_stage.steps.all()[0]

        response = self.client.get(
            self.url.replace("<slug:project_slug>", other_project.slug)
            .replace("<slug:stage_slug>", other_stage.slug)
            .replace("<slug:step_slug>", other_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
