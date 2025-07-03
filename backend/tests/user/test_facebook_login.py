from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from ..helpers import mock_auth_return_value
from const import Urls


class FacebookLoginViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.FACEBOOK_LOGIN}"
        self.valid_access_token = "valid_facebook_access_token"
        self.invalid_access_token = "invalid_facebook_access_token"
        self.facebook_user_data = {
            "email": "testuser@example.com",
            "first_name": "Test",
            "last_name": "User",
            "picture": {"data": {"url": "https://example.com/pic.jpg"}},
        }

    @patch("user.login.facebook.views.download_and_assign_image")
    @patch("requests.get")
    def test_facebook_login_success(self, get_mock, download_image_mock):
        mock_auth_return_value(get_mock, self.facebook_user_data)
        """Test successful login with Facebook"""
        response = self.client.post(
            self.url, {"access_token": self.valid_access_token}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.facebook_user_data["email"])
        self.assertEqual(
            response.data["first_name"], self.facebook_user_data["first_name"]
        )
        self.assertEqual(
            response.data["last_name"], self.facebook_user_data["last_name"]
        )

        download_image_mock.assert_called_once()

        # Check if the user was created or fetched
        user_exists = (
            get_user_model()
            .objects.filter(email=self.facebook_user_data["email"])
            .exists()
        )
        self.assertTrue(user_exists)

    @patch("user.login.facebook.views.download_and_assign_image")
    @patch("requests.get")
    def test_facebook_login_existing_user(self, get_mock, download_image_mock):
        """Test login for an existing user"""
        mock_auth_return_value(get_mock, self.facebook_user_data)

        get_user_model().objects.create_user(
            email="testuser@example.com",
            username="testuser",
            first_name="Test",
            last_name="User",
            image="https://example.com/avatar.jpg",
        )

        response = self.client.post(
            self.url, {"access_token": self.valid_access_token}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        download_image_mock.assert_not_called()

        # Ensure the user still exists and was not duplicated
        users_count = (
            get_user_model().objects.filter(email="testuser@example.com").count()
        )
        self.assertEqual(users_count, 1)

    @patch("requests.get")
    def test_facebook_login_invalid_token(self, get_mock):
        mock_auth_return_value(get_mock, {"error": "Invalid OAuth access token"})
        """Test invalid token during Facebook login"""
        response = self.client.post(
            self.url, {"access_token": self.invalid_access_token}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["root"], "Invalid token")

    def test_facebook_login_no_access_token(self):
        """Test when no access token is provided"""
        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["root"], "Access token is required")

    @patch("requests.get")
    def test_facebook_login_missing_email(self, get_mock):
        facebook_data_missing_email = self.facebook_user_data.copy()
        facebook_data_missing_email.pop("email")
        mock_auth_return_value(get_mock, {"error": "Invalid OAuth access token"})
        """Test when the email is missing in the Facebook response"""
        response = self.client.post(
            self.url, {"access_token": self.valid_access_token}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["root"], "Invalid token")
