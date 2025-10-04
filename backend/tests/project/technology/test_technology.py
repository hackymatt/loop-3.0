from django.test import TestCase
from rest_framework import status
from project.technology.models import Technology
from rest_framework.test import APIClient
from const import Urls
from ...helpers import login
from ...factory import (
    create_admin,
    create_student,
    create_technology,
    create_student,
    create_project,
    create_review,
    create_project_enrollment,
)


class TechnologyViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.PROJECT_TECHNOLOGY}"

        # Create admin and regular user
        self.admin, self.admin_password = create_admin(is_active=True)
        self.student, self.student_password = create_student(is_active=True)

        # Create a project technology
        self.project_technology = create_technology()
        create_project(
            technology=[self.project_technology],
            active=True,
            project_prerequisites=[],
            blog_prerequisites=[],
            similar=[],
        )

    # CREATE (Only Admin)
    def test_create_project_technology_admin(self):
        login(self, self.admin.user.email, self.admin_password)
        data = {"slug": "javascript", "name": "JavaScript"}
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

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
        self.project_1 = create_project(
            active=True,
            project_prerequisites=[],
            blog_prerequisites=[],
            technology=[self.technology_1],
            similar=[],
        )
        self.project_2 = create_project(
            active=True,
            project_prerequisites=[],
            blog_prerequisites=[],
            technology=[self.technology_2],
            similar=[],
        )

        self.student_1, _ = create_student(is_active=True)
        self.student_2, _ = create_student(is_active=True)
        self.student_3, _ = create_student(is_active=True)

        # Enroll users in projects
        create_project_enrollment(project=self.project_1, student=self.student_1)
        create_project_enrollment(project=self.project_2, student=self.student_2)

        # Add reviews for Python project
        create_review(student=self.student_1, project=self.project_1, rating=5)
        create_review(student=self.student_2, project=self.project_1, rating=4)

        # Add reviews for JavaScript project
        create_review(student=self.student_2, project=self.project_2, rating=4)
        create_review(student=self.student_3, project=self.project_2, rating=5)

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
