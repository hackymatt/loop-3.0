from unittest.mock import patch
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from const import Urls
from utils.google.gmail import GmailApi
from ..helpers import mock_send_message
from ..factory import create_student


class RegisterViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.REGISTER}"
        self.valid_data = {"email": "testuser@example.com", "password": "Password123!"}
        self.invalid_data = {
            "email": "invalidemail.com",  # Invalid email format
            "password": "Password123!",
        }
        # Create a user in the database for testing the existing email scenario
        self.existing_student, self.existing_student_password = create_student()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_valid_data(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test user registration with valid data and mock send_activation_email"""
        response = self.client.post(self.url, self.valid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], self.valid_data["email"])
        self.assertTrue(
            get_user_model().objects.filter(email=self.valid_data["email"]).exists()
        )

        # Assert that send_activation_email was called once
        send_message_mock.assert_called_once()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_username_exists(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test user registration with valid data, same username and mock send_activation_email"""
        data = {
            **self.valid_data,
            "email": "existinguser@address.com",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], data["email"])
        self.assertTrue(get_user_model().objects.filter(email=data["email"]).exists())

        # Assert that send_activation_email was called once
        send_message_mock.assert_called_once()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_existing_email(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test user registration with an already existing email"""
        response = self.client.post(
            self.url,
            {
                "email": self.existing_student.user.email,
                "password": self.existing_student_password,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.assertEqual(
            response.data["email"], ["Account with this email address already exists."]
        )

        # Assert that send_activation_email was not called for an existing user
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_invalid_email(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test user registration with invalid email format"""
        response = self.client.post(self.url, self.invalid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.assertEqual(response.data["email"], ["Enter a valid email address."])

        # Assert that send_activation_email was not called
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_missing_password(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test user registration without a password"""
        data = {
            "email": "userwithoutpassword@example.com",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)
        self.assertEqual(response.data["password"], ["This field is required."])

        # Assert that send_activation_email was not called
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_short_password(self, send_message_mock):
        """Test user registration with a password that's too short"""
        data = {"email": "user@example.com", "password": "short"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)
        self.assertEqual(
            response.data["password"], ["Password must be at least 8 characters long."]
        )
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_missing_uppercase_password(self, send_message_mock):
        """Test user registration with a password missing an uppercase letter"""
        data = {"email": "user@example.com", "password": "password1!"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)
        self.assertEqual(
            response.data["password"],
            ["Password must contain at least one uppercase letter."],
        )
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_missing_lowercase_password(self, send_message_mock):
        """Test user registration with a password missing a lowercase letter"""
        data = {"email": "user@example.com", "password": "PASSWORD1!"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)
        self.assertEqual(
            response.data["password"],
            ["Password must contain at least one lowercase letter."],
        )
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_missing_special_char_password(self, send_message_mock):
        """Test user registration with a password missing a special character"""
        data = {"email": "user@example.com", "password": "Password1"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)
        self.assertEqual(
            response.data["password"],
            ["Password must contain at least one special character."],
        )
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_missing_digit_password(self, send_message_mock):
        """Test user registration with a password missing a digit"""
        data = {"email": "user@example.com", "password": "Password!"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)
        self.assertEqual(
            response.data["password"], ["Password must contain at least one digit."]
        )
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_valid_password(self, send_message_mock):
        """Test user registration with a valid password"""
        data = {"email": "user@example.com", "password": "ValidPassword1!"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("email", response.data)
        self.assertEqual(response.data["email"], "user@example.com")

        # Assert that the activation email was sent
        send_message_mock.assert_called_once()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_missing_email(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test user registration without an email"""
        data = {"password": "Password123!"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.assertEqual(response.data["email"], ["This field is required."])

        # Assert that send_activation_email was not called
        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_register_user_missing_fields(self, send_message_mock):
        mock_send_message(mock=send_message_mock)
        """Test user registration with missing required fields (email and password)"""
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.assertIn("password", response.data)

        # Assert that send_activation_email was not called
        send_message_mock.assert_not_called()
