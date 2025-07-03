from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from const import Urls
from utils.google.gmail import GmailApi
from ..helpers import mock_send_message


class ContactAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.CONTACT}"

    @patch.object(GmailApi, "_send_message")
    def test_contact_post(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test that a POST request to /contact/ sends the correct data and returns a 200 response."""
        contact_data = {
            "name": "John Doe",
            "email": "johndoe@example.com",
            "message": "This is a test message.",
        }

        # Make the POST request to the contact endpoint
        response = self.client.post(self.url, contact_data, format="json")

        # Check if the response is successful (HTTP 200 OK)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify that the mock Mailer.send method was called
        send_message_mock.assert_called_once()

        # Optionally, check the response data if you want to ensure it's correct
        self.assertEqual(response.data, contact_data)
