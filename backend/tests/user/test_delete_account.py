from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from const import Urls
from ..factory import create_student
from ..helpers import login


class DeleteAccountTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.DELETE_ACCOUNT}"

        self.student, self.student_password = create_student()
        self.username = self.student.user.username

        login(self, self.student.user.email, self.student_password)

    def test_delete_account_success(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            get_user_model().objects.filter(username=self.username).exists()
        )

    def test_delete_account_not_authenticated(self):
        self.client.logout()
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_account_missing_refresh_token(self):
        self.client.cookies.clear()
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_account_incorrect_refresh_token(self):
        self.client.cookies["refresh_token"] = "invalid"
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["root"][0], "Refresh token is required")
