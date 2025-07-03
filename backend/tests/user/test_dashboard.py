from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from course.progress.models import CourseProgress
from course.enrollment.models import CourseEnrollment
from certificate.models import Certificate
from const import Urls
from ..factory import create_student, create_course
from ..helpers import login


class DashboardViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.DASHBOARD}"

        # Create user and student
        self.student, self.student_password = create_student()

        # Create course
        self.course = create_course()

        # Create course enrollment
        CourseEnrollment.objects.create(student=self.student, course=self.course)

        # Create certificate
        Certificate.objects.create(
            student=self.student,
            course=self.course,
        )

    def test_dashboard_data_with_progress_today(self):
        # Create course progress (completed lesson)
        CourseProgress.objects.create(
            student=self.student,
            completed_at=timezone.now(),
            points=10,
            lesson=self.course.chapters.all()[0].lessons.all()[0],
        )

        login(self, self.student.user.email, self.student_password)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIn("total_points", data)
        self.assertEqual(data["total_points"], 10)

        self.assertIn("daily_streak", data)
        self.assertEqual(data["daily_streak"], 1)

        self.assertIn("courses", data)
        self.assertEqual(len(data["courses"]), 1)

        self.assertIn("certificates", data)
        self.assertEqual(len(data["certificates"]), 1)

    def test_dashboard_data_with_progress_before(self):
        # Create course progress (completed lesson)
        CourseProgress.objects.create(
            student=self.student,
            completed_at=timezone.now() - timezone.timedelta(days=10),
            points=10,
            lesson=self.course.chapters.all()[0].lessons.all()[0],
        )

        login(self, self.student.user.email, self.student_password)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIn("total_points", data)
        self.assertEqual(data["total_points"], 10)

        self.assertIn("daily_streak", data)
        self.assertEqual(data["daily_streak"], 0)

        self.assertIn("courses", data)
        self.assertEqual(len(data["courses"]), 1)

        self.assertIn("certificates", data)
        self.assertEqual(len(data["certificates"]), 1)

    def test_dashboard_data_without_progress(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIn("total_points", data)
        self.assertEqual(data["total_points"], 0)

        self.assertIn("daily_streak", data)
        self.assertEqual(data["daily_streak"], 0)

        self.assertIn("courses", data)
        self.assertEqual(len(data["courses"]), 1)

        self.assertIn("certificates", data)
        self.assertEqual(len(data["certificates"]), 1)
