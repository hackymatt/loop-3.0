from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from const import Urls, JoinType
from ..factory import create_student
from ..helpers import login


class ChangePasswordTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.PASSWORD_CHANGE}"

        self.student, self.student_password = create_student()

        login(self, self.student.user.email, self.student_password)

    def test_change_password_success(self):
        data = {
            "old_password": self.student_password,
            "new_password": "Newpassword123!",
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.user.refresh_from_db()
        self.assertTrue(self.student.user.check_password("Newpassword123!"))

    def test_change_password_invalid_old_password(self):
        data = {"old_password": "wrongpassword", "new_password": "Newpassword123!"}

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("old_password", response.data)

    def test_change_password_social_join_type(self):
        self.student.user.join_type = JoinType.GITHUB
        self.student.user.save()
        data = {
            "old_password": self.student_password,
            "new_password": "Newpassword123!",
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_missing_fields(self):
        data = {}

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("old_password", response.data)
        self.assertIn("new_password", response.data)

    def test_change_password_weak_new_password(self):
        data = {"old_password": self.student_password, "new_password": "123"}

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)
