from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from const import Urls
from ..factory import create_student


class RefreshTokenViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.REFRESH_TOKEN}"

        # Create a user to test the token refresh
        self.student, self.student_password = create_student()

        # Generate refresh token for the user
        self.refresh_token = RefreshToken.for_user(self.student.user)

    def test_refresh_token_success(self):
        # Set the refresh token in cookies
        response = self.client.post(
            self.url, HTTP_COOKIE=f"refresh_token={self.refresh_token}"
        )

        # Check if the response is successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if cookies were set (this is just a check, ensure your 'set_cookies' logic works)
        self.assertIn("refresh_token", response.cookies)
        self.assertIn("access_token", response.cookies)

    def test_missing_refresh_token(self):
        # Send a request with no refresh token
        response = self.client.post(self.url)

        # Assert that the response is unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("refresh_token", response.cookies)  # It should clear the cookies
