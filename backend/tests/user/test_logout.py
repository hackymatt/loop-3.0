from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from const import Urls
from ..factory import create_student
from ..helpers import login


class LogoutViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LOGOUT}"
        """Set up a user and generate JWT tokens for testing."""
        self.student, self.student_password = create_student()
        self.refresh = RefreshToken.for_user(self.student.user)
        self.access_token = str(self.refresh.access_token)
        self.refresh_token = str(self.refresh)

    def test_successful_logout(self):
        """Ensure a user can successfully logout by blacklisting the refresh token."""
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url,
            {},
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}",
        )

        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

    def test_logout_without_authentication(self):
        """Ensure logout fails if user is not authenticated."""
        response = self.client.post(
            self.url,
            {},
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_invalid_refresh_token(self):
        """Ensure logout fails when refresh token is invalid."""
        login(self, self.student.user.email, self.student_password)
        self.client.cookies["refresh_token"] = "invalid.token.string"

        response = self.client.post(
            self.url,
            {},
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("root", response.data)
        self.assertEqual(response.data["root"][0], "Refresh token is required")

    def test_cookies_deleted_on_logout(self):
        """Ensure cookies are deleted after logout."""
        login(self, self.student.user.email, self.student_password)
        self.client.cookies["refresh_token"] = self.refresh_token

        response = self.client.post(
            self.url,
            {},
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}",
        )

        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
        self.assertEqual(response.cookies["access_token"]["max-age"], 0)
        self.assertEqual(response.cookies["refresh_token"]["max-age"], 0)
