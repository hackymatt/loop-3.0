from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
import stripe
from const import Urls, SubscriptionStatus, Currency, PaymentInterval, PlanType
from ....factory import create_student
from ....helpers import login
from plan.subscription.utils import subscribe
from plan.models import PlanPricing, Plan


class SubscriptionViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.SUBSCRIPTION}"

        self.student, self.password = create_student(is_active=True)

    def test_get_subscription(self):
        login(self, self.student.user.email, self.password)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["type"], "free")


class CancelSubscriptionViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.CANCEL_SUBSCRIPTION}"

        self.student, self.password = create_student(is_active=True)

    @patch("user.me.subscription.views.modify_subscription")
    def test_cancel_subscription_success(self, mock_modify):
        login(self, self.student.user.email, self.password)

        mock_modify.return_value = None

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.current_subscription.refresh_from_db()
        self.assertTrue(self.student.current_subscription.cancel_at_period_end)
        self.assertTrue(mock_modify.called_once())

    @patch(
        "user.me.subscription.views.modify_subscription",
        side_effect=stripe.error.StripeError("fail"),
    )
    def test_cancel_subscription_stripe_error(self, mock_modify):
        login(self, self.student.user.email, self.password)

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertTrue(mock_modify.called_once())


class RenewSubscriptionViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.RENEW_SUBSCRIPTION}"

        self.student, self.password = create_student(is_active=True)

        self.student.current_subscription.cancel_at_period_end = True
        self.student.current_subscription.save()

    @patch("user.me.subscription.views.modify_subscription")
    def test_renew_subscription_success(self, mock_modify):
        login(self, self.student.user.email, self.password)

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.current_subscription.refresh_from_db()
        self.assertFalse(self.student.current_subscription.cancel_at_period_end)

        self.assertTrue(mock_modify.called_once())

    @patch(
        "user.me.subscription.views.modify_subscription",
        side_effect=stripe.error.StripeError("fail"),
    )
    def test_renew_subscription_stripe_error(self, mock_modify):
        login(self, self.student.user.email, self.password)

        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertTrue(mock_modify.called_once())


class ChangeSubscriptionViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.CHANGE_SUBSCRIPTION}"

        self.student, self.password = create_student(is_active=True)

        basic_plan = Plan.objects.get(type=PlanType.BASIC)

        subscribe(
            self.student,
            basic_plan,
            timezone.now(),
            SubscriptionStatus.ACTIVE,
            basic_plan.get_pricings()[0],
            timezone.now() + timezone.timedelta(month=1),
            100,
            "sub_123",
            "item_123",
            None,
            False,
        )
        self.student.current_subscription.refresh_from_db()

        premium_plan = Plan.objects.get(type=PlanType.PREMIUM)

        self.new_pricing = PlanPricing.get_current_price(
            premium_plan, Currency.USD, PaymentInterval.MONTHLY
        )
        self.new_pricing.stripe_price_id = "new_price_123"
        self.new_pricing.save()

    @patch("user.me.subscription.views.modify_subscription")
    def test_change_subscription_success(self, mock_modify):
        login(self, self.student.user.email, self.password)

        data = {
            "plan": self.new_pricing.plan.type,
            "interval": self.new_pricing.interval,
            "currency": self.new_pricing.currency,
        }
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        mock_modify.assert_called_once_with(
            self.student.current_subscription.stripe_subscription_id,
            cancel_at_period_end=self.student.current_subscription.cancel_at_period_end,
            items=[
                {
                    "id": self.student.current_subscription.stripe_subscription_item_id,
                    "price": self.new_pricing.stripe_price_id,
                }
            ],
            proration_behavior="create_prorations",
        )

    @patch("user.me.subscription.views.modify_subscription")
    def test_change_subscription_with_trial_end(self, mock_modify):
        login(self, self.student.user.email, self.password)

        now = timezone.now()

        self.student.current_subscription.end_date = now
        self.student.current_subscription.status = SubscriptionStatus.TRIALING
        self.student.current_subscription.save()

        data = {
            "plan": self.new_pricing.plan.type,
            "interval": self.new_pricing.interval,
            "currency": self.new_pricing.currency,
        }
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        called_args, called_kwargs = mock_modify.call_args
        self.assertEqual(
            called_args[0], self.student.current_subscription.stripe_subscription_id
        )
        self.assertIn("trial_end", called_kwargs)
        self.assertEqual(called_kwargs["trial_end"], int(now.timestamp()))

    @patch(
        "user.me.subscription.views.modify_subscription",
        side_effect=stripe.error.StripeError("fail"),
    )
    def test_change_subscription_stripe_error(self, mock_modify):
        login(self, self.student.user.email, self.password)

        data = {
            "plan": self.new_pricing.plan.type,
            "interval": self.new_pricing.interval,
            "currency": self.new_pricing.currency,
        }
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        mock_modify.assert_called_once_with(
            self.student.current_subscription.stripe_subscription_id,
            cancel_at_period_end=self.student.current_subscription.cancel_at_period_end,
            items=[
                {
                    "id": self.student.current_subscription.stripe_subscription_item_id,
                    "price": self.new_pricing.stripe_price_id,
                }
            ],
            proration_behavior="create_prorations",
        )
