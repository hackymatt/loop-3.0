from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from const import Urls
from ..factory import create_student
from ..helpers import login
from django.conf import settings
from django.utils import timezone
import jwt
import datetime


class AccessTokenViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.ACCESS_TOKEN}"

        # Create a user to test the token refresh
        self.student, self.student_password = create_student()

    def test_get_returns_200_and_token(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        token = response.data["token"]
        self.assertIsInstance(token, str)

    def test_token_contains_valid_payload(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(self.url)
        token = response.data["token"]

        # decode using your SIMPLE_JWT settings
        signing_key = settings.SIMPLE_JWT.get("SIGNING_KEY", settings.SECRET_KEY)
        algorithm = settings.SIMPLE_JWT.get("ALGORITHM", "HS256")

        payload = jwt.decode(token, signing_key, algorithms=[algorithm])

        # check user_id
        self.assertEqual(payload.get("user_id"), str(self.student.user.id))

        # check iat/exp timing
        iat = datetime.datetime.fromtimestamp(payload["iat"], tz=timezone.utc)
        exp = datetime.datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        delta = exp - iat

        # allow ±5 seconds skew
        expected = datetime.timedelta(minutes=5)
        skew = datetime.timedelta(seconds=5)
        self.assertTrue(
            expected - skew <= delta <= expected + skew,
            f"Token lifetime {delta}, expected ~{expected}",
        )
