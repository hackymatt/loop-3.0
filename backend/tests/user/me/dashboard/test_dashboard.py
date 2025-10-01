from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from const import Urls
from ....factory import (
    create_student,
    create_instructor,
    create_project,
    create_certificate,
    create_project_enrollment,
    create_project_progress,
)
from ....helpers import login


class DashboardViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.DASHBOARD}"

        # Create user and student
        self.student, self.student_password = create_student(is_active=True)
        self.instructor, self.instructor_password = create_instructor(is_active=True)

        # Create project
        self.project = create_project(
            active=True, project_prerequisites=[], blog_prerequisites=[]
        )

        # Create project enrollment
        create_project_enrollment(student=self.student, project=self.project)

        # Create certificate
        create_certificate(
            student=self.student,
            project=self.project,
        )

    def test_dashboard_data_with_progress_today(self):
        # Create project progress (completed step)
        step = self.project.stages.all()[0].steps.all()[0]
        create_project_progress(
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
        create_project_progress(
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

    def test_dashboard_data_not_student(self):
        login(self, self.instructor.user.email, self.instructor_password)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()

        self.assertIn("profile", data)
        self.assertEqual(data["profile"]["user"]["plan_license"], None)
