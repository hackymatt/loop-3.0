from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from course.category.models import Category, CategoryTranslation
from const import Urls
from ...helpers import login
from ...factory import create_admin, create_student, create_category


class CategoryViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.COURSE_CATEGORY}"

        # Create admin and regular user
        self.admin, self.admin_password = create_admin()
        self.student, self.student_password = create_student()

        # Create a course category and translations
        self.category = create_category()

    # CREATE (Only Admin)
    def test_create_category_admin(self):
        login(self, self.admin.user.email, self.admin_password)
        data = {"slug": "backend", "language": "en", "name": "Backend"}
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.count(), 2)
        self.assertEqual(
            CategoryTranslation.objects.get(category__slug="backend").name,
            "Backend",
        )

    def test_create_category_regular_user(self):
        login(self, self.student.user.email, self.student_password)
        data = {"slug": "backend", "language": "en", "name": "Backend"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # READ (Allowed for Everyone)
    def test_get_course_categories_regular_user(self):
        """Ensure users can fetch course categories in their preferred language."""
        login(self, self.student.user.email, self.student_password)
        self.client.credentials(HTTP_ACCEPT_LANGUAGE="pl")
        response = self.client.get(self.url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(
            response.data["results"][0]["translated_name"],
            self.category.get_translation("pl").name,
        )

    def test_get_course_categories_anonymous(self):
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(
            response.data["results"][0]["translated_name"],
            self.category.get_translation("en").name,
        )

    # UPDATE TRANSLATION (Only Admin)
    def test_update_category_translation_admin(self):
        """Ensure admins can update translations for existing course categories."""
        login(self, self.admin.user.email, self.admin_password)
        data = {"slug": "backend", "language": "pl", "name": "Backend"}
        url = f"{self.url}/{self.category.id}"

        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            CategoryTranslation.objects.get(category=self.category, language="pl").name,
            "Backend",
        )

    def test_update_category_translation_regular_user(self):
        login(self, self.student.user.email, self.student_password)
        data = {"language": "pl", "name": "Backend"}
        url = f"{self.url}/{self.category.id}"

        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # DELETE (Only Admin)
    def test_delete_category_admin(self):
        login(self, self.admin.user.email, self.admin_password)
        url = f"{self.url}/{self.category.id}"

        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(slug="frontend").exists())

    def test_delete_category_regular_user(self):
        login(self, self.student.user.email, self.student_password)
        url = f"{self.url}/{self.category.id}"

        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
