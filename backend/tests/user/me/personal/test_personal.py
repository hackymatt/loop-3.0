from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch

from const import Urls
from ....factory import create_student
from ....helpers import login


class PersonalDataViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.DATA}"
        self.student, self.student_password = create_student(is_active=True)

    def test_authenticated_user_can_get_personal_data(self):
        login(self, self.student.user.email, self.student_password)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn("first_name", response.data)
        self.assertIn("last_name", response.data)
        self.assertEqual(response.data["email"], self.student.user.email)

    @patch("user.me.personal.views.update_customer")
    def test_authenticated_user_can_update_personal_data_with_stripe(
        self, mock_update_customer
    ):
        login(self, self.student.user.email, self.student_password)

        data = {
            "first_name": "NewFirst",
            "last_name": "NewLast",
            "street_address": "Main 1",
            "zip_code": "00-001",
            "city": "Warsaw",
            "country": "PL",
        }

        response = self.client.patch(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # DB updated
        self.student.user.refresh_from_db()
        self.assertEqual(self.student.user.first_name, "NewFirst")
        self.assertEqual(self.student.user.last_name, "NewLast")

        # Stripe update called
        mock_update_customer.assert_called_once()
        args, kwargs = mock_update_customer.call_args
        self.assertIn("name", kwargs)
        self.assertIn("address", kwargs)

    @patch("user.me.personal.views.update_customer")
    def test_authenticated_user_can_update_personal_data_without_stripe(
        self, mock_update_customer
    ):
        login(self, self.student.user.email, self.student_password)

        data = {
            "first_name": "NewFirst",
            "last_name": "NewLast",
            "street_address": "Main 1",
            "zip_code": "00-001",
            "city": "Warsaw",
            "country": "PL",
        }

        response = self.client.patch(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # DB updated
        self.student.user.refresh_from_db()
        self.assertEqual(self.student.user.first_name, "NewFirst")
        self.assertEqual(self.student.user.last_name, "NewLast")

        # Stripe update called
        mock_update_customer.assert_not_called()
