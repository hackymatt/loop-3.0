from django.test import TestCase
from rest_framework import status
from course.level.models import Level, LevelTranslation
from rest_framework.test import APIClient
from const import Urls
from ...helpers import login
from ...factory import create_admin, create_student, create_level


class LevelViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.COURSE_LEVEL}"

        # Create admin and regular user
        self.admin, self.admin_password = create_admin()
        self.student, self.student_password = create_student()

        # Create a course level and translations
        self.level = create_level()

    # CREATE (Only Admin)
    def test_create_level_admin(self):
        login(self, self.admin.user.email, self.admin_password)
        data = {"slug": "intermediate", "language": "en", "name": "Intermediate"}
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Level.objects.count(), 2)
        self.assertEqual(
            LevelTranslation.objects.get(level__slug="intermediate").name,
            "Intermediate",
        )

    def test_create_level_regular_user(self):
        login(self, self.student.user.email, self.student_password)
        data = {"slug": "intermediate", "language": "en", "name": "Intermediate"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # READ (Allowed for Everyone)
    def test_get_levels_regular_user(self):
        """Ensure users can fetch course levels in their preferred language."""
        login(self, self.student.user.email, self.student_password)
        self.client.credentials(HTTP_ACCEPT_LANGUAGE="pl")
        response = self.client.get(self.url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(
            response.data["results"][0]["translated_name"],
            self.level.get_translation("pl").name,
        )

    def test_get_levels_anonymous(self):
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(
            response.data["results"][0]["translated_name"],
            self.level.get_translation("en").name,
        )

    # UPDATE TRANSLATION (Only Admin)
    def test_update_level_translation_admin(self):
        """Ensure admins can update translations for existing course levels."""
        login(self, self.admin.user.email, self.admin_password)
        data = {"slug": "beginner", "language": "pl", "name": "Nowa Nazwa"}
        url = f"{self.url}/{self.level.id}"

        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            LevelTranslation.objects.get(level=self.level, language="pl").name,
            "Nowa Nazwa",
        )

    def test_update_level_translation_regular_user(self):
        login(self, self.student.user.email, self.student_password)
        data = {"language": "pl", "name": "Nowa Nazwa"}
        url = f"{self.url}/{self.level.id}"

        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # DELETE (Only Admin)
    def test_delete_level_admin(self):
        login(self, self.admin.user.email, self.admin_password)
        url = f"{self.url}/{self.level.id}"

        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Level.objects.filter(slug="beginner").exists())

    def test_delete_level_regular_user(self):
        login(self, self.student.user.email, self.student_password)
        url = f"{self.url}/{self.level.id}"

        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
