from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from plan.models import Plan
from ..factory import create_option, create_plan_option
from const import Urls
import random


class PlanListViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.PLAN}"

        self.plans = Plan.objects.all()
        options = [create_option() for _ in range(10)]

        for option in options:
            for plan in self.plans:
                create_plan_option(
                    plan=plan, option=option, disabled=random.choice([True, False])
                )

    def test_list_plans(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(len(data), 3)

        first_plan = data[0]
        self.assertIn("type", first_plan)
        self.assertIn("tokens_limit", first_plan)
        self.assertIn("license", first_plan)
        self.assertIn("popular", first_plan)
        self.assertIn("pricing", first_plan)
        self.assertIn("options", first_plan)

        self.assertIsInstance(first_plan["pricing"], list)

        self.assertIsInstance(first_plan["options"], list)
        if first_plan["options"]:
            option = first_plan["options"][0]
            self.assertIn("title", option)
            self.assertIn("disabled", option)

    def test_retrieve_plan_by_type(self):
        plan = self.plans[0]
        response = self.client.get(f"{self.url}/{plan.type}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        plan_data = response.data

        self.assertEqual(plan_data["type"], plan.type)
        self.assertEqual(plan_data["tokens_limit"], plan.tokens_limit)
        self.assertEqual(plan_data["popular"], plan.popular)
        self.assertIsNotNone(plan_data["license"])

        for pricing in plan_data["pricing"]:
            self.assertIn("currency", pricing)
            self.assertIn("interval", pricing)
            self.assertIn("price", pricing)

        for option in plan_data["options"]:
            self.assertIn("title", option)
            self.assertIn("disabled", option)
