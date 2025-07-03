from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from const import Urls
from ..factory import create_student
from ..helpers import login


class UpdateUserNameTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.DATA}"

        self.student, self.student_password = create_student()

    def test_authenticated_user_can_update_name(self):
        login(self, self.student.user.email, self.student_password)

        data = {"first_name": "NewFirst", "last_name": "NewLast"}

        response = self.client.patch(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.student.user.refresh_from_db()
        self.assertEqual(self.student.user.first_name, "NewFirst")
        self.assertEqual(self.student.user.last_name, "NewLast")

    def test_unauthenticated_user_cannot_update_name(self):
        data = {"first_name": "NewFirst", "last_name": "NewLast"}

        response = self.client.patch(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
