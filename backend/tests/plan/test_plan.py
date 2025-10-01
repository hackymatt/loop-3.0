# from django.test import TestCase
# from rest_framework import status
# from rest_framework.test import APIClient
# from plan.models import PlanOption
# from ..factory import create_plan, create_plan_option
# from const import Urls
# import random


# class PlanListViewTest(TestCase):
#     def setUp(self):
#         self.client = APIClient()
#         self.url = f"/{Urls.API}/{Urls.PLAN}"

#         self.plan_1 = create_plan()
#         self.plan_2 = create_plan()
#         self.plan_3 = create_plan()

#         options = [create_plan_option() for _ in range(10)]

#         for option in options:
#             PlanOption.objects.create(
#                 plan=self.plan_1, option=option, disabled=random.choice([True, False])
#             )
#             PlanOption.objects.create(
#                 plan=self.plan_2, option=option, disabled=random.choice([True, False])
#             )
#             PlanOption.objects.create(
#                 plan=self.plan_3, option=option, disabled=random.choice([True, False])
#             )

#     def test_plan_list_view(self):
#         response = self.client.get(self.url)

#         print(response.content)

#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertIsInstance(response.data, list)
#         self.assertEqual(len(response.data), 6)

#         plan = next((p for p in response.data if p["type"] == self.plan_1.type), None)
#         self.assertIsNotNone(plan)

#         monthly_price = next(
#             (p["price"] for p in plan["pricing"] if p["currency"] == "PLN" and p["interval"] == "monthly"),
#             None,
#         )
#         yearly_price = next(
#             (p["price"] for p in plan["pricing"] if p["currency"] == "PLN" and p["interval"] == "yearly"),
#             None,
#         )

#         self.assertEqual(
#             float(monthly_price),
#             float(self.plan_1.get_pricings()[0].monthly),
#         )
#         self.assertEqual(
#             float(yearly_price),
#             float(self.plan_1.get_pricings()[0].yearly),
#         )

#         self.assertEqual(plan["license"], self.plan_1.get_translation("en").license)
#         self.assertEqual(plan["popular"], self.plan_1.popular)
#         self.assertEqual(plan["premium"], self.plan_1.premium)

#         self.assertIn("options", plan)

#         option_data = plan["options"][0]
#         plan_option = self.plan_1.plan_options.first()

#         self.assertEqual(
#             option_data["title"], plan_option.option.get_translation("en").title
#         )
#         self.assertEqual(option_data["disabled"], plan_option.disabled)
