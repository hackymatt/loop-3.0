from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from ..helpers import mock_auth_return_value
from const import Urls


class GoogleLoginViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.GOOGLE_LOGIN}"
        self.google_data = {
            "email": "testuser@example.com",
            "given_name": "Test",
            "family_name": "User",
            "picture": "https://example.com/avatar.jpg",
        }

    @patch("user.login.google.views.download_and_assign_image")
    @patch("requests.get")
    def test_google_login_success(self, get_mock, download_image_mock):
        """Test successful login using Google OAuth"""
        mock_auth_return_value(get_mock, self.google_data)

        response = self.client.post(self.url, {"token": "valid_token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.google_data["email"])
        self.assertEqual(response.data["first_name"], self.google_data["given_name"])
        self.assertEqual(response.data["last_name"], self.google_data["family_name"])

        download_image_mock.assert_called_once()

        # Check if the user was created
        user = get_user_model().objects.filter(email=self.google_data["email"]).first()
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, self.google_data["given_name"])

    @patch("user.login.google.views.download_and_assign_image")
    @patch("requests.get")
    def test_google_login_existing_user(self, get_mock, download_image_mock):
        """Test login for an existing user"""
        mock_auth_return_value(get_mock, self.google_data)

        get_user_model().objects.create_user(
            email="testuser@example.com",
            username="testuser",
            first_name="Test",
            last_name="User",
            image="https://example.com/avatar.jpg",
        )

        response = self.client.post(self.url, {"token": "valid_token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        download_image_mock.assert_not_called()

        # Ensure the user still exists and was not duplicated
        users_count = (
            get_user_model().objects.filter(email="testuser@example.com").count()
        )
        self.assertEqual(users_count, 1)

    @patch("requests.get")
    def test_google_login_invalid_token(self, get_mock):
        """Test invalid Google OAuth token"""
        mock_auth_return_value(get_mock, {"error": "Invalid Token"})

        response = self.client.post(self.url, {"token": "invalid_token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["root"], "Invalid token")

    def test_google_login_missing_token(self):
        """Test missing token in request"""
        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
