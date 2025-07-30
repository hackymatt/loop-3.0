from django.test import TestCase
from rest_framework import status
from project.technology.models import Technology
from project.enrollment.models import ProjectEnrollment
from review.models import Review
from rest_framework.test import APIClient
from const import Urls
from ...helpers import login
from ...factory import (
    create_admin,
    create_student,
    create_technology,
    create_student,
    create_project,
)


class TechnologyViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.PROJECT_TECHNOLOGY}"

        # Create admin and regular user
        self.admin, self.admin_password = create_admin()
        self.student, self.student_password = create_student()

        # Create a project technology
        self.project_technology = create_technology()

    # CREATE (Only Admin)
    def test_create_project_technology_admin(self):
        login(self, self.admin.user.email, self.admin_password)
        data = {"slug": "javascript", "name": "JavaScript"}
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Technology.objects.count(), 2)

    def test_create_project_technology_regular_user(self):
        login(self, self.student.user.email, self.student_password)
        data = {"slug": "javascript", "name": "JavaScript"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # READ (Allowed for Everyone)
    def test_get_project_technologies(self):
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(
            response.data["results"][0]["name"], self.project_technology.name
        )

    # UPDATE (Only Admin)
    def test_update_project_technology_admin(self):
        login(self, self.admin.user.email, self.admin_password)
        data = {"slug": "typescript", "name": "TS"}
        url = f"{self.url}/{self.project_technology.id}"
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project_technology.refresh_from_db()
        self.assertEqual(self.project_technology.name, "TS")

    def test_update_project_technology_regular_user(self):
        login(self, self.student.user.email, self.student_password)
        data = {"name": "TS"}
        url = f"{self.url}/{self.project_technology.id}"
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # DELETE (Only Admin)
    def test_delete_project_technology_admin(self):
        login(self, self.admin.user.email, self.admin_password)
        url = f"{self.url}/{self.project_technology.id}"
        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Technology.objects.filter(slug="typescript").exists())

    def test_delete_project_technology_regular_user(self):
        login(self, self.student.user.email, self.student_password)
        url = f"{self.url}/{self.project_technology.id}"
        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class FeaturedTechnologiesViewTest(TestCase):
    def setUp(self):
        self.url = f"/{Urls.API}/{Urls.FEATURED_TECHNOLOGIES}"
        # Create projects for Python
        self.technology_1 = create_technology()
        self.technology_2 = create_technology()
        self.project_1 = create_project()
        self.project_2 = create_project()
        self.project_1.technology.clear()
        self.project_1.technology.add(self.technology_1)
        self.project_2.technology.clear()
        self.project_2.technology.add(self.technology_2)

        self.student_1, _ = create_student()
        self.student_2, _ = create_student()
        self.student_3, _ = create_student()

        # Enroll users in projects
        ProjectEnrollment.objects.create(project=self.project_1, student=self.student_1)
        ProjectEnrollment.objects.create(project=self.project_2, student=self.student_2)

        # Add reviews for Python project
        Review.objects.create(project=self.project_1, rating=5, student=self.student_1)
        Review.objects.create(project=self.project_1, rating=4, student=self.student_2)

        # Add reviews for JavaScript project
        Review.objects.create(project=self.project_2, rating=4, student=self.student_2)
        Review.objects.create(project=self.project_2, rating=3, student=self.student_3)

    def test_get_featured_technologies(self):
        # Call the API endpoint
        response = self.client.get(self.url)

        # Check the status code
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if the response data is a list
        self.assertIsInstance(response.data, list)

        # Check the number of technologies returned (should be 2 here)
        technologies_qs = self.project_1.technology.all().union(
            self.project_2.technology.all()
        )
        technologies_count = len(list(technologies_qs))
        self.assertEqual(len(response.data), technologies_count)

        # Check the technology names and slugs
        self.assertIn(
            response.data[0]["slug"],
            [technology.slug for technology in self.project_1.technology.all()],
        )
        self.assertIn(
            response.data[0]["name"],
            [technology.name for technology in self.project_1.technology.all()],
        )

        self.assertIn(
            response.data[1]["slug"],
            [technology.slug for technology in self.project_2.technology.all()],
        )
        self.assertIn(
            response.data[1]["name"],
            [technology.name for technology in self.project_2.technology.all()],
        )

    def test_featured_technologies_order_by_enrollments_and_rating(self):
        # Ensure that technologies are ordered by total enrollments and average rating
        response = self.client.get(self.url)
        # First technology should be Python due to higher enrollments and average rating
        self.assertEqual(response.data[0]["slug"], self.technology_1.slug)
        self.assertEqual(response.data[1]["slug"], self.technology_2.slug)
