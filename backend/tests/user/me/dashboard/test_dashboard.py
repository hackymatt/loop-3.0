from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from project.progress.models import ProjectProgress
from project.enrollment.models import ProjectEnrollment
from certificate.models import Certificate
from const import Urls
from ....factory import create_student, create_project
from ....helpers import login


class DashboardViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.DASHBOARD}"

        # Create user and student
        self.student, self.student_password = create_student()

        # Create project
        self.project = create_project()

        # Create project enrollment
        ProjectEnrollment.objects.create(student=self.student, project=self.project)

        # Create certificate
        Certificate.objects.create(
            student=self.student,
            project=self.project,
        )

    def test_dashboard_data_with_progress_today(self):
        # Create project progress (completed step)
        step = self.project.stages.all()[0].steps.all()[0]
        ProjectProgress.objects.create(
            student=self.student,
            completed_at=timezone.now(),
            step=step,
        )

        login(self, self.student.user.email, self.student_password)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIn("profile", data)
        self.assertEqual(data["profile"]["total_points"], step.points)

        self.assertIn("profile", data)
        self.assertEqual(data["profile"]["daily_streak"], 1)

        self.assertIn("projects", data)
        self.assertEqual(len(data["projects"]), 1)

        self.assertIn("certificates", data)
        self.assertEqual(len(data["certificates"]), 1)

    def test_dashboard_data_with_progress_before(self):
        # Create project progress (completed step)
        step = self.project.stages.all()[0].steps.all()[0]
        ProjectProgress.objects.create(
            student=self.student,
            completed_at=timezone.now() - timezone.timedelta(days=10),
            step=step,
        )

        login(self, self.student.user.email, self.student_password)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIn("profile", data)
        self.assertEqual(data["profile"]["total_points"], step.points)

        self.assertIn("profile", data)
        self.assertEqual(data["profile"]["daily_streak"], 0)

        self.assertIn("projects", data)
        self.assertEqual(len(data["projects"]), 1)

        self.assertIn("certificates", data)
        self.assertEqual(len(data["certificates"]), 1)

    def test_dashboard_data_without_progress(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIn("profile", data)
        self.assertEqual(data["profile"]["total_points"], 0)

        self.assertIn("profile", data)
        self.assertEqual(data["profile"]["daily_streak"], 0)

        self.assertIn("projects", data)
        self.assertEqual(len(data["projects"]), 1)

        self.assertIn("certificates", data)
        self.assertEqual(len(data["certificates"]), 1)
