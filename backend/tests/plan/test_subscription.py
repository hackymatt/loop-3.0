from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from plan.models import PlanOption
from plan.subscription.models import PlanSubscription
from plan.utils import get_default_plan
from plan.subscription.utils import get_subscription
from ..factory import create_plan, create_plan_option, create_student
from ..helpers import login
from const import Urls
from datetime import timedelta
from django.utils import timezone
import random


class SubscribeViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.SUBSCRIBE}"

        self.student, self.student_password = create_student()

        self.plan_1 = create_plan()
        self.plan_2 = create_plan()
        self.plan_3 = create_plan()

        options = [create_plan_option() for _ in range(10)]

        for option in options:
            PlanOption.objects.create(
                plan=self.plan_1, option=option, disabled=random.choice([True, False])
            )
            PlanOption.objects.create(
                plan=self.plan_2, option=option, disabled=random.choice([True, False])
            )
            PlanOption.objects.create(
                plan=self.plan_3, option=option, disabled=random.choice([True, False])
            )

    def test_subscribe_with_yearly_plan(self):
        login(self, self.student.user.email, self.student_password)
        payload = {
            "user": {"first_name": "New first name", "last_name": "New last name"},
            "plan": self.plan_1.slug,
            "interval": "yearly",
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.student.user.refresh_from_db()
        self.assertEqual(self.student.user.first_name, "New first name")
        self.assertEqual(self.student.user.last_name, "New last name")

        sub = get_subscription(user=self.student.user)
        self.assertIsNotNone(sub.end_date)
        self.assertAlmostEqual(
            sub.end_date.date(),
            (timezone.now() + timedelta(days=365)).date(),
            delta=timedelta(days=1),
        )

    def test_subscribe_with_monthly_plan(self):
        login(self, self.student.user.email, self.student_password)
        payload = {
            "user": {"first_name": "New first name", "last_name": "New last name"},
            "plan": self.plan_1.slug,
            "interval": "monthly",
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        sub = get_subscription(user=self.student.user)
        self.assertIsNotNone(sub.end_date)
        self.assertAlmostEqual(
            sub.end_date.date(),
            (timezone.now() + timedelta(days=30)).date(),
            delta=timedelta(days=3),  # month length may vary
        )

    def test_subscribe_to_free_plan(self):
        login(self, self.student.user.email, self.student_password)
        payload = {
            "user": {"first_name": "New first name", "last_name": "New last name"},
            "plan": get_default_plan().slug,
            "interval": "monthly",
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        sub = get_subscription(user=self.student.user)
        self.assertIsNone(sub.end_date)

    def test_invalid_plan(self):
        login(self, self.student.user.email, self.student_password)
        payload = {
            "user": {"first_name": "Test", "last_name": "User"},
            "plan": "nonexistent",
            "interval": "monthly",
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
