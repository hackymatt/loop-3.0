import uuid
from rest_framework import status
from django.test import TestCase
from rest_framework.test import APIClient
from const import Urls
from ..factory import create_student
from ..helpers import generate_valid_token, generate_expired_token


class PasswordResetConfirmTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.PASSWORD_RESET_CONFIRM}"
        """Create a test user."""
        self.student, _ = create_student()

        # Generate a valid JWT token for the user
        self.valid_token = generate_valid_token(self.student.user.id)

        # Generate an expired JWT token
        self.expired_token = generate_expired_token(self.student.user.id)

        # Invalid token (corrupted string)
        self.invalid_token = "invalid.token.string"

        # Nonexistent user token
        self.nonexistent_user_token = generate_valid_token(uuid.uuid4())

    def test_successful_password_reset(self):
        """Ensure a valid token allows password reset."""
        response = self.client.post(
            self.url,
            {"token": self.valid_token, "password": "NewSecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.student.user.email)

        # Ensure the password has actually changed
        self.student.user.refresh_from_db()
        self.assertTrue(self.student.user.check_password("NewSecurePass123!"))

    def test_expired_token(self):
        """Ensure an expired token returns a 400 error."""
        response = self.client.post(
            self.url,
            {"token": self.expired_token, "password": "NewSecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["root"], "Invalid reset password link")

    def test_invalid_token(self):
        """Ensure an invalid token returns a 400 error."""
        response = self.client.post(
            self.url,
            {"token": self.invalid_token, "password": "NewSecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["root"], "Invalid token")

    def test_nonexistent_user(self):
        """Ensure a token for a nonexistent user returns a 404 error."""
        response = self.client.post(
            self.url,
            {"token": self.nonexistent_user_token, "password": "NewSecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["root"], "User not found")

    def test_missing_token(self):
        """Ensure request without a token fails."""
        response = self.client.post(
            self.url,
            {"password": "NewSecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_password(self):
        """Ensure request without a password fails."""
        response = self.client.post(
            self.url,
            {"token": self.valid_token},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_password(self):
        """Ensure request with invalid password fails."""
        response = self.client.post(
            self.url,
            {"token": self.valid_token, "password": "NewSecurePass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
