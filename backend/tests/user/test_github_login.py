from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from ..helpers import mock_auth_return_value, mock_auth_side_effect
from const import Urls


class GithubLoginViewTest(TestCase):
    def setUp(self):
        """Set up the test client, API URL, and test data."""
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.GITHUB_LOGIN}"
        self.valid_code = "valid_code"
        self.access_token = "valid_access_token"
        self.github_user_data = {
            "login": "testuser",
            "id": 123456,
            "avatar_url": "https://avatars.githubusercontent.com/u/123456?v=4",
            "email": "testuser@example.com",
            "name": "Test User",
        }

    @patch("user.login.github.views.download_and_assign_image")
    @patch("requests.post")
    @patch("requests.get")
    def test_github_login_success(self, get_mock, post_mock, download_image_mock):
        """Test successful GitHub login."""
        # Mock the response for exchanging code for access token
        mock_auth_return_value(post_mock, {"access_token": self.access_token})
        # Mock the response for retrieving user data
        mock_auth_return_value(get_mock, self.github_user_data)

        response = self.client.post(self.url, {"code": self.valid_code}, format="json")

        # Ensure the response is successful and contains necessary tokens
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.github_user_data["email"])
        self.assertEqual(
            response.data["first_name"], self.github_user_data["name"].split(" ")[0]
        )
        self.assertEqual(
            response.data["last_name"], self.github_user_data["name"].split(" ")[1]
        )

        download_image_mock.assert_called_once()

        # Check if the user has been created in the database
        user_exists = (
            get_user_model()
            .objects.filter(email=self.github_user_data["email"])
            .exists()
        )
        self.assertTrue(user_exists)

    @patch("user.login.github.views.download_and_assign_image")
    @patch("requests.post")
    @patch("requests.get")
    def test_github_login_existing_user(self, get_mock, post_mock, download_image_mock):
        """Test login for an existing user"""
        # Mock the response for exchanging code for access token
        mock_auth_return_value(post_mock, {"access_token": self.access_token})
        # Mock the response for retrieving user data
        mock_auth_return_value(get_mock, self.github_user_data)

        get_user_model().objects.create_user(
            email="testuser@example.com",
            username="testuser",
            first_name="Test",
            last_name="User",
            image="https://example.com/avatar.jpg",
        )

        response = self.client.post(self.url, {"code": self.valid_code}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        download_image_mock.assert_not_called()

        # Ensure the user still exists and was not duplicated
        users_count = (
            get_user_model().objects.filter(email="testuser@example.com").count()
        )
        self.assertEqual(users_count, 1)

    @patch("user.login.github.views.download_and_assign_image")
    @patch("requests.post")
    @patch("requests.get")
    def test_github_login_no_email(self, get_mock, post_mock, download_image_mock):
        """Test GitHub login when API does not return an email."""
        mock_auth_return_value(post_mock, {"access_token": self.access_token})
        mock_auth_return_value(get_mock, self.github_user_data)

        # Modify GitHub user data to exclude email
        github_user_no_email = self.github_user_data.copy()
        github_user_no_email.pop("email")

        # Simulate two API responses: first without email, second fetching email separately
        mock_auth_side_effect(
            get_mock,
            [
                type(
                    "Response", (object,), {"json": lambda: github_user_no_email}
                ),  # First request
                type(
                    "Response",
                    (object,),
                    {
                        "json": lambda: [
                            {
                                "email": "test@example.com",
                                "primary": True,
                                "verified": True,
                            }
                        ]
                    },
                ),  # Second request (email list)
            ],
        )

        response = self.client.post(self.url, {"code": self.valid_code}, format="json")

        download_image_mock.assert_called_once()

        # Ensure the response is successful and email is retrieved
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "test@example.com")

    @patch("requests.post")
    def test_github_login_invalid_code(self, post_mock):
        """Test GitHub login with an invalid authorization code."""
        mock_auth_return_value(post_mock, {"error": "bad_verification_code"})

        response = self.client.post(self.url, {"code": "invalid_code"}, format="json")

        # Ensure a 400 Bad Request is returned
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["root"], "Failed to retrieve access token")

    @patch("requests.post")
    @patch("requests.get")
    def test_github_login_no_email_available(self, get_mock, post_mock):
        """Test GitHub login when neither profile nor /user/emails endpoint returns an email."""
        mock_auth_return_value(post_mock, {"access_token": self.access_token})

        # Modify GitHub user data to exclude email
        github_user_no_email = self.github_user_data.copy()
        github_user_no_email.pop("email")

        # Simulate two API responses: first without email, second returning an empty email list
        mock_auth_side_effect(
            get_mock,
            [
                type(
                    "Response", (object,), {"json": lambda: github_user_no_email}
                ),  # First request
                type(
                    "Response", (object,), {"json": lambda: []}
                ),  # Second request (no emails available)
            ],
        )

        response = self.client.post(self.url, {"code": self.valid_code}, format="json")

        # Ensure a 400 Bad Request is returned due to missing email
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["root"], "No email found in GitHub account")

    def test_github_login_missing_code(self):
        """Test GitHub login when the 'code' parameter is missing."""
        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["root"], "Code is required")
