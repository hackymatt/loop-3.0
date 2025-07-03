import uuid
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch
from const import Urls
from utils.google.gmail import GmailApi
from ..helpers import mock_send_message, generate_valid_token
from ..factory import create_student


class ResendActivationLinkViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.RESEND}"
        # Create a test user (inactive)
        self.student, _ = create_student()
        self.student.user.is_active = False
        self.student.user.save()

        # Generate a token for the user
        self.token = generate_valid_token(self.student.user.id)

    @patch.object(GmailApi, "_send_message")  # Mocking send_activation_email
    def test_resend_activation_link_missing_token_and_email(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test when both token and email are missing."""
        data = {}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["root"], "You must provide either a token or an email."
        )
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_resend_activation_link_invalid_token(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test when the provided token is invalid."""
        invalid_token = "invalidtoken"
        data = {"token": invalid_token}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["root"], "Invalid token.")
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_resend_activation_link_user_not_found(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test when the user is not found (invalid token or email)."""
        non_existing_token = generate_valid_token(uuid.uuid4())  # Non-existing user ID
        data = {"token": non_existing_token}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["root"], "User not found.")
        send_message_mock.assert_not_called()

        # Test with email for a non-existing user
        data = {"email": "nonexistent@example.com"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["root"], "User not found.")
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_resend_activation_link_active_user(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test when the user is already active, no email is sent."""
        self.student.user.is_active = True
        self.student.user.save()

        data = {"token": self.token}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.student.user.email)
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_resend_activation_link_successful(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test when the user is inactive and an activation email is sent."""
        data = {"token": self.token}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], self.student.user.email)
        send_message_mock.assert_called_once()

    @patch.object(GmailApi, "_send_message")
    def test_resend_activation_link_by_email(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test when activation email is resent by email instead of token."""
        data = {"email": self.student.user.email}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], self.student.user.email)
        send_message_mock.assert_called_once()
