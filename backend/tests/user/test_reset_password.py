from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from const import Urls
from utils.google.gmail import GmailApi
from ..helpers import mock_send_message
from ..factory import create_student


class PasswordResetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.PASSWORD_RESET}"
        self.student, _ = create_student()

    @patch.object(GmailApi, "_send_message")
    def test_password_reset_request_valid_email(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        response = self.client.post(self.url, {"email": self.student.user.email})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Assert that send_activation_email was called once
        send_message_mock.assert_called_once()

    @patch.object(GmailApi, "_send_message")
    def test_password_reset_request_invalid_email(self, send_message_mock):
        response = self.client.post(self.url, {"email": "wrong@example.com"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        send_message_mock.assert_not_called()
