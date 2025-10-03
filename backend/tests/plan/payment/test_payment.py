from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from const import Urls, SubscriptionStatus, PlanType, PaymentStatus, PaymentType
from invoice.models import Invoice, StudentInvoice
from plan.models import Plan
from plan.payment.models import (
    PaymentMethod,
    CardPaymentMethod,
    PayPalPaymentMethod,
    RevolutPaymentMethod,
)
from unittest.mock import patch, MagicMock
import stripe
from ...factory import create_student, create_plan_pricing, create_payment_discount
from ...helpers import login


class CreateSetupIntentViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.CREATE_SETUP_INTENT}"

        self.student, self.student_password = create_student(is_active=True)

    @patch("plan.payment.views.create_customer")
    @patch("plan.payment.views.create_setup_intent")
    @patch("plan.payment.views.create_customer_session")
    def test_create_setup_intent_success(
        self, mock_session, mock_setup_intent, mock_create_customer
    ):
        login(self, self.student.user.email, self.student_password)

        mock_create_customer.return_value = MagicMock(id="cus_test123")
        mock_setup_intent.return_value = MagicMock(client_secret="seti_secret_123")
        mock_session.return_value = MagicMock(client_secret="cs_test_123")

        self.student.stripe_customer_id = None
        self.student.save()

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertIn("client_secret", data)
        self.assertIn("customer_session_client_secret", data)
        self.assertEqual(data["client_secret"], "seti_secret_123")
        self.assertEqual(data["customer_session_client_secret"], "cs_test_123")

        self.student.refresh_from_db()
        self.assertEqual(self.student.stripe_customer_id, "cus_test123")

        mock_create_customer.assert_called_once_with(email=self.student.user.email)
        mock_setup_intent.assert_called_once_with(customer_id="cus_test123")
        mock_session.assert_called_once_with(
            customer_id="cus_test123",
            components={
                "payment_element": {
                    "enabled": True,
                    "features": {"payment_method_redisplay": "enabled"},
                }
            },
        )

    @patch(
        "plan.payment.views.create_setup_intent",
        side_effect=stripe.error.StripeError("fail"),
    )
    def test_create_setup_intent_stripe_error(self, mock_setup_intent):
        login(self, self.student.user.email, self.student_password)

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.data
        self.assertIn("error", data)
        self.assertEqual(data["error"], "fail")
        mock_setup_intent.assert_called_once_with(
            customer_id=self.student.stripe_customer_id
        )


class CreateSubscriptionViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.CREATE_SUBSCRIPTION}"

        self.student, self.student_password = create_student(is_active=True)

        self.plan = Plan.objects.first()
        self.pricing = create_plan_pricing(plan=self.plan, valid_from=timezone.now())
        self.discount = create_payment_discount(
            active=True,
            restrictions={},
            currency=self.pricing.currency,
            expires_at=timezone.now() + timezone.timedelta(weeks=52),
        )

    @patch("plan.payment.views.create_customer")
    @patch("plan.payment.views.create_subscription")
    def test_create_subscription_success(
        self, mock_create_subscription, mock_create_customer
    ):
        login(self, self.student.user.email, self.student_password)

        self.student.stripe_customer_id = None
        self.student.save()

        mock_create_customer.return_value = MagicMock(id="cus_test123")

        mock_subscription = MagicMock()
        mock_subscription.status = SubscriptionStatus.ACTIVE
        mock_subscription.latest_invoice.payment_intent = None
        mock_create_subscription.return_value = mock_subscription

        data = {
            "plan": self.plan.type,
            "interval": self.pricing.interval,
            "currency": self.pricing.currency,
        }

        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "succeeded")

        self.student.refresh_from_db()
        self.assertEqual(self.student.stripe_customer_id, "cus_test123")

        mock_create_customer.assert_called_once_with(email=self.student.user.email)
        mock_create_subscription.assert_called_once()
        subscription_args = mock_create_subscription.call_args[1]
        self.assertEqual(subscription_args["customer_id"], "cus_test123")
        self.assertEqual(
            subscription_args["items"], [{"price": self.pricing.stripe_price_id}]
        )

    @patch("plan.payment.views.create_customer")
    @patch("plan.payment.views.create_subscription")
    def test_create_subscription_payment_intent_success(
        self, mock_create_subscription, mock_create_customer
    ):
        login(self, self.student.user.email, self.student_password)

        self.student.stripe_customer_id = None
        self.student.save()

        mock_create_customer.return_value = MagicMock(id="cus_test123")

        mock_subscription = MagicMock()
        mock_subscription.status = SubscriptionStatus.INCOMPLETE
        mock_subscription.latest_invoice.payment_intent.status = "succeeded"
        mock_create_subscription.return_value = mock_subscription

        data = {
            "plan": self.plan.type,
            "interval": self.pricing.interval,
            "currency": self.pricing.currency,
        }

        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "succeeded")

        self.student.refresh_from_db()
        self.assertEqual(self.student.stripe_customer_id, "cus_test123")

        mock_create_customer.assert_called_once_with(email=self.student.user.email)
        mock_create_subscription.assert_called_once()
        subscription_args = mock_create_subscription.call_args[1]
        self.assertEqual(subscription_args["customer_id"], "cus_test123")
        self.assertEqual(
            subscription_args["items"], [{"price": self.pricing.stripe_price_id}]
        )

    @patch("plan.payment.views.create_customer")
    @patch("plan.payment.views.create_subscription")
    def test_create_subscription_payment_intent_failed(
        self, mock_create_subscription, mock_create_customer
    ):
        login(self, self.student.user.email, self.student_password)

        self.student.stripe_customer_id = None
        self.student.save()

        mock_create_customer.return_value = MagicMock(id="cus_test123")

        mock_subscription = MagicMock()
        mock_subscription.status = SubscriptionStatus.INCOMPLETE
        mock_subscription.latest_invoice.payment_intent = None
        mock_create_subscription.return_value = mock_subscription

        data = {
            "plan": self.plan.type,
            "interval": self.pricing.interval,
            "currency": self.pricing.currency,
        }

        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "failed")

        self.student.refresh_from_db()
        self.assertEqual(self.student.stripe_customer_id, "cus_test123")

        mock_create_customer.assert_called_once_with(email=self.student.user.email)
        mock_create_subscription.assert_called_once()
        subscription_args = mock_create_subscription.call_args[1]
        self.assertEqual(subscription_args["customer_id"], "cus_test123")
        self.assertEqual(
            subscription_args["items"], [{"price": self.pricing.stripe_price_id}]
        )

    @patch("plan.payment.views.create_customer")
    @patch("plan.payment.views.create_subscription")
    @patch("plan.payment.utils.retrieve_promotion_code")
    def test_create_subscription_valid_discount(
        self, mock_retrieve_promo, mock_create_subscription, mock_create_customer
    ):
        login(self, self.student.user.email, self.student_password)

        self.student.stripe_customer_id = None
        self.student.save()

        mock_promo = MagicMock()
        mock_promo.times_redeemed = 1
        mock_retrieve_promo.return_value = mock_promo

        mock_create_customer.return_value = MagicMock(id="cus_test123")

        mock_subscription = MagicMock()
        mock_subscription.status = SubscriptionStatus.ACTIVE
        mock_subscription.latest_invoice.payment_intent = None
        mock_create_subscription.return_value = mock_subscription

        data = {
            "plan": self.plan.type,
            "interval": self.pricing.interval,
            "currency": self.pricing.currency,
            "code": self.discount.code,
        }

        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "succeeded")

        self.student.refresh_from_db()
        self.assertEqual(self.student.stripe_customer_id, "cus_test123")

        mock_create_customer.assert_called_once_with(email=self.student.user.email)
        mock_create_subscription.assert_called_once()
        subscription_args = mock_create_subscription.call_args[1]
        self.assertEqual(subscription_args["customer_id"], "cus_test123")
        self.assertEqual(
            subscription_args["items"], [{"price": self.pricing.stripe_price_id}]
        )

        mock_retrieve_promo.called_once_with(self.discount.stripe_promotion_code_id)

    def test_create_subscription_invalid_discount(self):
        login(self, self.student.user.email, self.student_password)

        data = {
            "plan": self.plan.type,
            "interval": self.pricing.interval,
            "currency": self.pricing.currency,
            "code": "INVALID",
        }

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("discount", response.data)
        self.assertEqual(response.data["discount"], "Invalid promotion code")

    @patch("plan.payment.views.create_customer")
    @patch("plan.payment.views.create_subscription")
    def test_create_subscription_without_discount(
        self, mock_create_subscription, mock_create_customer
    ):
        login(self, self.student.user.email, self.student_password)

        mock_create_customer.return_value = MagicMock(id="cus_test123")

        self.student.stripe_customer_id = None
        self.student.save()

        mock_subscription = MagicMock()
        mock_subscription.status = SubscriptionStatus.ACTIVE
        mock_subscription.latest_invoice.payment_intent = None
        mock_create_subscription.return_value = mock_subscription

        data = {
            "plan": self.plan.type,
            "interval": self.pricing.interval,
            "currency": self.pricing.currency,
        }

        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "succeeded")

        self.student.refresh_from_db()
        self.assertEqual(self.student.stripe_customer_id, "cus_test123")

        mock_create_customer.assert_called_once_with(email=self.student.user.email)
        mock_create_subscription.assert_called_once()
        subscription_args = mock_create_subscription.call_args[1]
        self.assertEqual(subscription_args["customer_id"], "cus_test123")
        self.assertEqual(
            subscription_args["items"], [{"price": self.pricing.stripe_price_id}]
        )

    @patch("plan.payment.views.create_customer")
    @patch("plan.payment.views.create_subscription")
    def test_create_subscription_success_with_trial_used(
        self, mock_create_subscription, mock_create_customer
    ):
        login(self, self.student.user.email, self.student_password)

        mock_create_customer.return_value = MagicMock(id="cus_test123")

        self.student.stripe_customer_id = None
        self.student.trial_used = True
        self.student.save()

        mock_subscription = MagicMock()
        mock_subscription.status = SubscriptionStatus.ACTIVE
        mock_subscription.latest_invoice.payment_intent = None
        mock_create_subscription.return_value = mock_subscription

        data = {
            "plan": self.plan.type,
            "interval": self.pricing.interval,
            "currency": self.pricing.currency,
        }

        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "succeeded")

        self.student.refresh_from_db()
        self.assertEqual(self.student.stripe_customer_id, "cus_test123")

        mock_create_customer.assert_called_once_with(email=self.student.user.email)
        mock_create_subscription.assert_called_once()
        subscription_args = mock_create_subscription.call_args[1]
        self.assertEqual(subscription_args["customer_id"], "cus_test123")
        self.assertEqual(
            subscription_args["items"], [{"price": self.pricing.stripe_price_id}]
        )

    @patch("plan.payment.views.create_customer")
    @patch("plan.payment.views.create_subscription")
    def test_create_subscription_success_without_trial_used(
        self, mock_create_subscription, mock_create_customer
    ):
        login(self, self.student.user.email, self.student_password)

        mock_create_customer.return_value = MagicMock(id="cus_test123")

        self.student.stripe_customer_id = None
        self.student.trial_used = False
        self.student.save()

        mock_subscription = MagicMock()
        mock_subscription.status = SubscriptionStatus.ACTIVE
        mock_subscription.latest_invoice.payment_intent = None
        mock_create_subscription.return_value = mock_subscription

        data = {
            "plan": self.plan.type,
            "interval": self.pricing.interval,
            "currency": self.pricing.currency,
        }

        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "succeeded")

        self.student.refresh_from_db()
        self.assertEqual(self.student.stripe_customer_id, "cus_test123")

        mock_create_customer.assert_called_once_with(email=self.student.user.email)
        mock_create_subscription.assert_called_once()
        subscription_args = mock_create_subscription.call_args[1]
        self.assertEqual(subscription_args["customer_id"], "cus_test123")
        self.assertEqual(
            subscription_args["items"], [{"price": self.pricing.stripe_price_id}]
        )

    @patch(
        "plan.payment.views.create_subscription",
        side_effect=stripe.error.StripeError("Stripe failed"),
    )
    def test_create_subscription_stripe_error(self, mock_create_subscription):
        login(self, self.student.user.email, self.student_password)

        data = {
            "plan": self.plan.type,
            "interval": self.pricing.interval,
            "currency": self.pricing.currency,
        }

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "Stripe failed")

        mock_create_subscription.assert_called_once()
        subscription_args = mock_create_subscription.call_args[1]
        self.assertEqual(
            subscription_args["customer_id"], self.student.stripe_customer_id
        )
        self.assertEqual(
            subscription_args["items"], [{"price": self.pricing.stripe_price_id}]
        )


class ValidateCouponViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.VALIDATE_COUPON}"

        self.student, self.student_password = create_student(is_active=True)

        self.plan = Plan.objects.first()
        self.pricing = create_plan_pricing(plan=self.plan, valid_from=timezone.now())
        self.discount = create_payment_discount(
            active=True,
            restrictions={},
            expires_at=timezone.now() + timezone.timedelta(weeks=52),
        )
        self.discount.max_redemptions = None
        self.discount.save()

    @patch("plan.payment.utils.retrieve_promotion_code")
    def test_invalid_code(self, mock_retrieve_promo):
        login(self, self.student.user.email, self.student_password)

        data = {
            "code": "INVALID",
            "plan": self.plan.type,
            "currency": self.discount.currency,
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["discount"], "Invalid promotion code")

        mock_retrieve_promo.assert_not_called()

    @patch("plan.payment.utils.retrieve_promotion_code")
    def test_inactive_coupon(self, mock_retrieve_promo):
        login(self, self.student.user.email, self.student_password)

        self.discount.active = False
        self.discount.save()

        data = {
            "code": self.discount.code,
            "plan": self.plan.type,
            "currency": self.discount.currency,
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["discount"], "Coupon is inactive")

        mock_retrieve_promo.assert_not_called()

    @patch("plan.payment.utils.retrieve_promotion_code")
    def test_expired_coupon(self, mock_retrieve_promo):
        login(self, self.student.user.email, self.student_password)

        self.discount.expires_at = timezone.now() - timezone.timedelta(days=1)
        self.discount.save()

        data = {
            "code": self.discount.code,
            "plan": self.plan.type,
            "currency": self.discount.currency,
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["discount"], "Coupon has expired")

        mock_retrieve_promo.assert_not_called()

    @patch("plan.payment.utils.retrieve_promotion_code")
    def test_wrong_currency(self, mock_retrieve_promo):
        login(self, self.student.user.email, self.student_password)

        data = {"code": self.discount.code, "plan": self.plan.type, "currency": "XXX"}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["discount"], "Coupon is not valid for this currency"
        )

        mock_retrieve_promo.assert_not_called()

    @patch("plan.payment.utils.retrieve_promotion_code")
    def test_max_redemptions_exceeded(self, mock_retrieve_promo):
        login(self, self.student.user.email, self.student_password)

        mock_promo = MagicMock()
        mock_promo.times_redeemed = 1
        mock_retrieve_promo.return_value = mock_promo

        self.discount.max_redemptions = 1
        self.discount.save()

        data = {
            "code": self.discount.code,
            "plan": self.plan.type,
            "currency": self.discount.currency,
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["discount"], "Coupon has already been used")

        mock_retrieve_promo.called_once_with(self.discount.stripe_promotion_code_id)

    @patch("plan.payment.utils.retrieve_promotion_code")
    def test_restriction_wrong_product(self, mock_retrieve_promo):
        login(self, self.student.user.email, self.student_password)

        self.discount.restrictions = {"applies_to": {"products": ["prod_other"]}}
        self.discount.save()

        data = {
            "code": self.discount.code,
            "plan": self.plan.type,
            "currency": self.discount.currency,
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["discount"], "Coupon does not apply to this product"
        )

        mock_retrieve_promo.assert_not_called()

    @patch("plan.payment.utils.retrieve_promotion_code")
    def test_restriction_first_time_purchase(self, mock_retrieve_promo):
        login(self, self.student.user.email, self.student_password)

        self.discount.restrictions = {"first_time_transaction": True}
        self.discount.save()

        self.student.first_purchase = False
        self.student.save()

        data = {
            "code": self.discount.code,
            "plan": self.plan.type,
            "currency": self.discount.currency,
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["discount"], "Coupon is only for first-time purchase"
        )

        mock_retrieve_promo.assert_not_called()

    @patch("plan.payment.utils.retrieve_promotion_code")
    def test_restriction_customer(self, mock_retrieve_promo):
        login(self, self.student.user.email, self.student_password)

        self.discount.restrictions = {"customer": "cus_other"}
        self.discount.save()

        data = {
            "code": self.discount.code,
            "plan": self.plan.type,
            "currency": self.discount.currency,
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["discount"], "Coupon cannot be used by this customer"
        )

        mock_retrieve_promo.assert_not_called()

    @patch("plan.payment.utils.retrieve_promotion_code")
    def test_valid_percentage_discount(self, mock_retrieve_promo):
        login(self, self.student.user.email, self.student_password)

        self.discount.percent_off = 20
        self.discount.amount_off = None
        self.discount.save()

        data = {
            "code": self.discount.code,
            "plan": self.plan.type,
            "currency": self.discount.currency,
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["value"], 20)
        self.assertTrue(response.data["is_percentage"])

        mock_retrieve_promo.assert_not_called()

    @patch("plan.payment.utils.retrieve_promotion_code")
    def test_valid_amount_discount(self, mock_retrieve_promo):
        login(self, self.student.user.email, self.student_password)

        self.discount.percent_off = None
        self.discount.amount_off = 500
        self.discount.save()

        data = {
            "code": self.discount.code,
            "plan": self.plan.type,
            "currency": self.discount.currency,
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["value"], 500)
        self.assertFalse(response.data["is_percentage"])

        mock_retrieve_promo.assert_not_called()


class PreviewInvoiceViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.PREVIEW_INVOICE}"

        self.student, self.student_password = create_student(is_active=True)

        self.plan = Plan.objects.first()
        self.pricing = create_plan_pricing(plan=self.plan, valid_from=timezone.now())

    @patch("plan.payment.views.preview_invoice")
    def test_preview_invoice_success(self, mock_preview_invoice):
        login(self, self.student.user.email, self.student_password)

        # Mocked Stripe invoice response
        mock_preview_invoice.return_value = {
            "lines": {
                "data": [
                    {
                        "amount": -500,  # old plan refund
                        "period": {"end": 1699999999},
                    },
                    {
                        "amount": 1500,  # new plan charge
                        "period": {"end": 1700000000},
                    },
                ]
            }
        }

        data = {
            "plan": self.plan.type,
            "interval": self.pricing.interval,
            "currency": self.pricing.currency,
        }
        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.data

        self.assertIn("amount_due", result)
        self.assertIn("billing_date", result)

        # (1500 + -500) / 100 = 10
        self.assertEqual(result["amount_due"], 10)
        self.assertTrue(result["billing_date"].startswith("20"))

        mock_preview_invoice.assert_called_once_with(
            customer_id=self.student.stripe_customer_id,
            subscription=self.student.current_subscription.stripe_subscription_id,
            subscription_details={
                "items": [
                    {
                        "id": self.student.current_subscription.stripe_subscription_item_id,
                        "price": self.pricing.stripe_price_id,
                    }
                ]
            },
        )

    @patch(
        "plan.payment.views.preview_invoice",
        side_effect=Exception("Stripe preview failed"),
    )
    def test_preview_invoice_failure(self, mock_preview_invoice):
        login(self, self.student.user.email, self.student_password)

        data = {
            "plan": self.plan.type,
            "interval": self.pricing.interval,
            "currency": self.pricing.currency,
        }
        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "Stripe preview failed")

        mock_preview_invoice.assert_called_once()


class StripeWebhookViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.STRIPE_WEBHOOK}"

        self.student, self.password = create_student(
            is_active=True, stripe_customer_id="cus_test123"
        )
        self.plan = Plan.objects.first()
        self.pricing = create_plan_pricing(plan=self.plan, valid_from=timezone.now())
        self.discount = create_payment_discount(
            active=True,
            restrictions={},
            expires_at=timezone.now() + timezone.timedelta(weeks=52),
        )

    @patch("plan.payment.views.construct_event", side_effect=ValueError("bad payload"))
    def test_construct_event_value_error_returns_400(self, mock_construct):
        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_construct.assert_called_once()

    @patch(
        "plan.payment.views.construct_event",
        side_effect=stripe.error.SignatureVerificationError("bad sig", "header"),
    )
    def test_construct_event_signature_error_returns_400(self, mock_construct):
        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_construct.assert_called_once()

    @patch("plan.payment.views.construct_event")
    def test_subscription_created(self, mock_construct):
        subscription_id = "sub_123"
        subscription_item_id = "sub_item_123"
        start_date = int(timezone.now().timestamp())
        end_date = int((timezone.now() + timezone.timedelta(days=30)).timestamp())

        mock_construct.return_value = {
            "type": "customer.subscription.created",
            "data": {
                "object": {
                    "id": subscription_id,
                    "customer": self.student.stripe_customer_id,
                    "items": {
                        "data": [
                            {
                                "price": {"id": self.pricing.stripe_price_id},
                                "id": subscription_item_id,
                                "current_period_start": start_date,
                                "current_period_end": end_date,
                            }
                        ]
                    },
                    "status": SubscriptionStatus.ACTIVE,
                    "metadata": {"promotion_code_id": "promo_123"},
                }
            },
        }

        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # refresh student from db
        self.student.refresh_from_db()

        subscription = self.student.current_subscription
        self.assertIsNotNone(subscription)
        self.assertEqual(subscription.stripe_subscription_id, subscription_id)
        self.assertEqual(subscription.stripe_subscription_item_id, subscription_item_id)
        self.assertEqual(subscription.status, SubscriptionStatus.ACTIVE)
        self.assertEqual(subscription.plan, self.pricing.plan)
        self.assertEqual(subscription.plan_pricing, self.pricing)
        self.assertEqual(
            subscription.start_date,
            timezone.datetime.fromtimestamp(start_date, tz=timezone.utc),
        )
        self.assertEqual(
            subscription.end_date,
            timezone.datetime.fromtimestamp(end_date, tz=timezone.utc),
        )
        self.assertEqual(subscription.stripe_promotion_code_id, "promo_123")
        self.assertFalse(subscription.cancel_at_period_end)

        # also assert trial_used got updated
        self.assertTrue(self.student.trial_used)

    @patch("plan.payment.views.construct_event")
    def test_subscription_updated_active(self, mock_construct):
        subscription_id = "sub_123"
        subscription_item_id = "sub_item_123"
        start_date = int(timezone.now().timestamp())
        end_date = int((timezone.now() + timezone.timedelta(days=30)).timestamp())

        mock_construct.return_value = {
            "type": "customer.subscription.updated",
            "data": {
                "object": {
                    "id": subscription_id,
                    "customer": self.student.stripe_customer_id,
                    "items": {
                        "data": [
                            {
                                "price": {"id": self.pricing.stripe_price_id},
                                "id": subscription_item_id,
                                "current_period_start": start_date,
                                "current_period_end": end_date,
                            }
                        ]
                    },
                    "status": SubscriptionStatus.ACTIVE,
                    "metadata": {"website_url": "http://test", "language": "en"},
                }
            },
        }

        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # reload student
        self.student.refresh_from_db()
        subscription = self.student.current_subscription

        # validate subscription details
        self.assertIsNotNone(subscription)
        self.assertEqual(subscription.stripe_subscription_id, subscription_id)
        self.assertEqual(subscription.stripe_subscription_item_id, subscription_item_id)
        self.assertEqual(subscription.status, SubscriptionStatus.ACTIVE)
        self.assertEqual(subscription.plan, self.pricing.plan)
        self.assertEqual(subscription.plan_pricing, self.pricing)
        self.assertEqual(
            subscription.start_date,
            timezone.datetime.fromtimestamp(start_date, tz=timezone.utc),
        )
        self.assertEqual(
            subscription.end_date,
            timezone.datetime.fromtimestamp(end_date, tz=timezone.utc),
        )

        # ACTIVE should respect cancel_at_period_end=False
        self.assertFalse(subscription.cancel_at_period_end)

    @patch("plan.payment.views.construct_event")
    @patch("plan.payment.views.send_cancel_email")
    def test_subscription_updated_canceled(
        self, mock_send_cancel_email, mock_construct
    ):
        # set event data for a canceled subscription
        subscription_id = "sub_123"
        subscription_item_id = "sub_item_123"
        start_date_ts = int(timezone.now().timestamp())
        end_date_ts = int((timezone.now() + timezone.timedelta(days=30)).timestamp())

        mock_construct.return_value = {
            "type": "customer.subscription.updated",
            "data": {
                "object": {
                    "id": subscription_id,
                    "customer": self.student.stripe_customer_id,
                    "items": {
                        "data": [
                            {
                                "price": {"id": self.pricing.stripe_price_id},
                                "id": subscription_item_id,
                                "current_period_start": start_date_ts,
                                "current_period_end": end_date_ts,
                            }
                        ]
                    },
                    "status": SubscriptionStatus.CANCELED,
                    "metadata": {"website_url": "http://test", "language": "en"},
                    "cancel_at_period_end": True,
                }
            },
        }

        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # reload student subscription
        self.student.refresh_from_db()
        subscription = self.student.current_subscription

        # canceled status should switch to free plan
        self.assertEqual(
            subscription.plan.type, PlanType.FREE
        )  # assuming your free plan type is 'free'
        self.assertEqual(
            subscription.start_date,
            timezone.datetime.fromtimestamp(end_date_ts, tz=timezone.utc),
        )

        # assert cancel email sent
        mock_send_cancel_email.assert_called_once_with(
            self.student, self.student.user.email, "http://test", "en"
        )

    @patch("plan.payment.views.construct_event")
    @patch("plan.payment.views.logger")
    def test_subscription_updated_with_unhandled_status(
        self, mock_logger, mock_construct
    ):
        start_ts = int(timezone.now().timestamp())
        end_ts = int((timezone.now() + timezone.timedelta(days=30)).timestamp())

        mock_construct.return_value = {
            "type": "customer.subscription.updated",
            "data": {
                "object": {
                    "id": "sub_123",
                    "customer": self.student.stripe_customer_id,
                    "items": {
                        "data": [
                            {
                                "price": {"id": self.pricing.stripe_price_id},
                                "id": "sub_item_123",
                                "current_period_start": start_ts,
                                "current_period_end": end_ts,
                            }
                        ]
                    },
                    "status": "weird_status",  # <-- triggers else branch
                    "metadata": {"website_url": "http://test", "language": "en"},
                }
            },
        }

        response = self.client.post(
            self.url,
            data=b"{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="sig_test",
        )

        # Should still return 200
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify logger.info was called
        mock_logger.info.assert_called_once_with(
            "Not handled subscription status: weird_status"
        )

    @patch("plan.payment.views.construct_event")
    @patch("plan.payment.views.send_cancel_email")
    def test_subscription_deleted(self, mock_send_cancel_email, mock_construct):
        # Set up a fake Stripe event for subscription.deleted
        subscription_item_id = "sub_item_123"
        end_date_ts = int((timezone.now() + timezone.timedelta(days=30)).timestamp())

        mock_construct.return_value = {
            "type": "customer.subscription.deleted",
            "data": {
                "object": {
                    "customer": self.student.stripe_customer_id,
                    "items": {
                        "data": [
                            {
                                "id": subscription_item_id,
                                "current_period_end": end_date_ts,
                            }
                        ]
                    },
                    "metadata": {"website_url": "http://test", "language": "en"},
                }
            },
        }

        # Trigger the webhook
        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # Reload student subscription
        self.student.refresh_from_db()
        subscription = self.student.current_subscription

        # After deletion, student should be on free plan
        self.assertEqual(
            subscription.plan.type, "free"
        )  # assuming free plan type is 'free'
        self.assertEqual(
            subscription.start_date,
            timezone.datetime.fromtimestamp(end_date_ts, tz=timezone.utc),
        )

        # Ensure cancel email is sent
        mock_send_cancel_email.assert_called_once_with(
            self.student, self.student.user.email, "http://test", "en"
        )

    @patch("plan.payment.views.generate_and_send_invoice")
    @patch("plan.payment.views.preview_invoice")
    @patch("plan.payment.views.construct_event")
    def test_handle_invoice_payment_succeeded_with_discount(
        self, mock_construct, mock_preview_invoice, mock_generate_send
    ):
        mock_preview_invoice.return_value = {"amount_due": 10000}  # cents

        data = {
            "customer": self.student.stripe_customer_id,
            "lines": {
                "data": [
                    {
                        "quantity": 1,
                        "pricing": {
                            "price_details": {"price": self.pricing.stripe_price_id}
                        },
                    }
                ]
            },
            "currency": "USD",
            "total_discount_amounts": [{"amount": 1000}],
            "parent": {
                "subscription_details": {
                    "metadata": {
                        "language": "en",
                        "website_url": "http://test",
                        "promotion_code_id": self.discount.stripe_promotion_code_id,
                    },
                    "subscription": "sub_123",
                }
            },
            "amount_due": 10000,
        }

        mock_construct.return_value = {
            "type": "invoice.payment_succeeded",
            "data": {"object": data},
        }

        # Trigger webhook like a real event
        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # Reload student
        self.student.refresh_from_db()
        self.assertFalse(self.student.first_purchase)
        self.assertEqual(
            self.student.current_subscription.amount_due, Decimal("100.00")
        )

        # Check Invoice is created
        invoice = Invoice.objects.get(customer__email=self.student.user.email)
        self.assertEqual(invoice.currency, "USD")
        self.assertEqual(invoice.status, PaymentStatus.PAID)
        self.assertEqual(invoice.language, "en")
        self.assertEqual(invoice.items.count(), 2)  # plan + discount

        # Check StudentInvoice created
        student_invoice = StudentInvoice.objects.get(student=self.student)
        self.assertEqual(student_invoice.invoice, invoice)

        # Check generate_and_send_invoice called
        mock_generate_send.assert_called_once_with(
            invoice, "http://test", self.student.user.first_name
        )

    @patch("plan.payment.views.generate_and_send_invoice")
    @patch("plan.payment.views.preview_invoice")
    @patch("plan.payment.views.construct_event")
    def test_handle_invoice_payment_succeeded_without_discount(
        self, mock_construct, mock_preview_invoice, mock_generate_send
    ):
        mock_preview_invoice.return_value = {"amount_due": 10000}  # cents

        data = {
            "customer": self.student.stripe_customer_id,
            "lines": {
                "data": [
                    {
                        "quantity": 1,
                        "pricing": {
                            "price_details": {"price": self.pricing.stripe_price_id}
                        },
                    }
                ]
            },
            "currency": "USD",
            "parent": {
                "subscription_details": {
                    "metadata": {
                        "language": "en",
                        "website_url": "http://test",
                    },
                    "subscription": "sub_123",
                }
            },
            "amount_due": 10000,
        }

        mock_construct.return_value = {
            "type": "invoice.payment_succeeded",
            "data": {"object": data},
        }

        # Trigger webhook like a real event
        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # Reload student
        self.student.refresh_from_db()
        self.assertFalse(self.student.first_purchase)
        self.assertEqual(
            self.student.current_subscription.amount_due, Decimal("100.00")
        )

        # Check Invoice is created
        invoice = Invoice.objects.get(customer__email=self.student.user.email)
        self.assertEqual(invoice.currency, "USD")
        self.assertEqual(invoice.status, PaymentStatus.PAID)
        self.assertEqual(invoice.language, "en")
        self.assertEqual(invoice.items.count(), 1)  # plan

        # Check StudentInvoice created
        student_invoice = StudentInvoice.objects.get(student=self.student)
        self.assertEqual(student_invoice.invoice, invoice)

        # Check generate_and_send_invoice called
        mock_generate_send.assert_called_once_with(
            invoice, "http://test", self.student.user.first_name
        )

    @patch("plan.payment.views.generate_and_send_invoice")
    @patch("plan.payment.views.preview_invoice")
    @patch("plan.payment.views.construct_event")
    def test_handle_invoice_payment_succeeded_without_invoice(
        self, mock_construct, mock_preview_invoice, mock_generate_send
    ):
        mock_preview_invoice.return_value = {"amount_due": None}

        data = {
            "customer": self.student.stripe_customer_id,
            "lines": {
                "data": [
                    {
                        "quantity": 1,
                        "pricing": {
                            "price_details": {"price": self.pricing.stripe_price_id}
                        },
                    }
                ]
            },
            "currency": "USD",
            "parent": {
                "subscription_details": {
                    "metadata": {
                        "language": "en",
                        "website_url": "http://test",
                    },
                    "subscription": "sub_123",
                }
            },
            "amount_due": 10000,
        }

        mock_construct.return_value = {
            "type": "invoice.payment_succeeded",
            "data": {"object": data},
        }

        # Trigger webhook like a real event
        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # Reload student
        self.student.refresh_from_db()
        self.assertFalse(self.student.first_purchase)
        self.assertIsNone(self.student.current_subscription.amount_due)

        # Check Invoice is created
        invoice = Invoice.objects.get(customer__email=self.student.user.email)
        self.assertEqual(invoice.currency, "USD")
        self.assertEqual(invoice.status, PaymentStatus.PAID)
        self.assertEqual(invoice.language, "en")
        self.assertEqual(invoice.items.count(), 1)  # plan

        # Check StudentInvoice created
        student_invoice = StudentInvoice.objects.get(student=self.student)
        self.assertEqual(student_invoice.invoice, invoice)

        # Check generate_and_send_invoice called
        mock_generate_send.assert_called_once_with(
            invoice, "http://test", self.student.user.first_name
        )

    @patch("plan.payment.views.generate_and_send_invoice")
    @patch("plan.payment.views.preview_invoice")
    @patch("plan.payment.views.construct_event")
    def test_handle_invoice_payment_succeeded_zero(
        self, mock_construct, mock_preview_invoice, mock_generate_send
    ):
        mock_preview_invoice.return_value = {"amount_due": 0}  # cents

        data = {
            "customer": self.student.stripe_customer_id,
            "lines": {
                "data": [
                    {
                        "quantity": 1,
                        "pricing": {
                            "price_details": {"price": self.pricing.stripe_price_id}
                        },
                    }
                ]
            },
            "currency": "USD",
            "parent": {
                "subscription_details": {
                    "metadata": {
                        "language": "en",
                        "website_url": "http://test",
                    },
                    "subscription": "sub_123",
                }
            },
            "amount_due": 0,
        }

        mock_construct.return_value = {
            "type": "invoice.payment_succeeded",
            "data": {"object": data},
        }

        # Trigger webhook like a real event
        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # Check Invoice is NOT created
        self.assertFalse(
            Invoice.objects.filter(customer__email=self.student.user.email).exists()
        )
        self.assertFalse(StudentInvoice.objects.filter(student=self.student).exists())

        # Check generate_and_send_invoice NOT called
        mock_generate_send.assert_not_called()

    @patch("plan.payment.views.send_payment_failed_email")
    @patch("plan.payment.views.construct_event")
    def test_handle_invoice_payment_failed(
        self, mock_construct, mock_send_failed_email
    ):
        data = {
            "customer": self.student.stripe_customer_id,
            "parent": {
                "subscription_details": {
                    "metadata": {
                        "language": "en",
                        "website_url": "http://test",
                    }
                }
            },
        }

        mock_construct.return_value = {
            "type": "invoice.payment_failed",
            "data": {"object": data},
        }

        # Trigger webhook request
        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # Ensure email is sent with correct args
        mock_send_failed_email.assert_called_once_with(
            self.student, self.student.stripe_customer_id, "http://test", "en"
        )

    @patch("plan.payment.views.modify_payment_method")
    @patch("plan.payment.views.update_customer")
    @patch("plan.payment.views.retrieve_payment_method")
    @patch("plan.payment.views.construct_event")
    def test_handle_card_payment_method(
        self, mock_construct, mock_retrieve, mock_update_customer, mock_modify
    ):
        mock_retrieve.return_value = {
            "type": PaymentType.CARD,
            "card": {
                "brand": "visa",
                "display_brand": "Visa",
                "last4": "4242",
                "exp_month": 12,
                "exp_year": 2030,
                "wallet": {"type": "apple_pay"},
            },
            "billing_details": {"name": "John Doe"},
        }
        mock_construct.return_value = {
            "type": "setup_intent.succeeded",
            "data": {
                "object": {
                    "customer": self.student.stripe_customer_id,
                    "payment_method": "pm_123",
                }
            },
        }

        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        pm = PaymentMethod.objects.get(student=self.student)
        self.assertTrue(pm.is_default)
        card = CardPaymentMethod.objects.get(payment_method=pm)
        self.assertEqual(card.last4, "4242")
        self.assertEqual(card.holder, "John Doe")
        self.assertEqual(card.wallet, "apple_pay")

        mock_update_customer.assert_called_once_with(
            self.student.stripe_customer_id,
            invoice_settings={"default_payment_method": "pm_123"},
        )
        mock_modify.assert_called_once_with("pm_123", allow_redisplay="always")

    @patch("plan.payment.views.modify_payment_method")
    @patch("plan.payment.views.update_customer")
    @patch("plan.payment.views.retrieve_payment_method")
    @patch("plan.payment.views.construct_event")
    def test_handle_paypal_payment_method(
        self, mock_construct, mock_retrieve, mock_update_customer, mock_modify
    ):
        mock_retrieve.return_value = {
            "type": PaymentType.PAYPAL,
            "paypal": {"payer_email": "test@example.com"},
        }
        mock_construct.return_value = {
            "type": "setup_intent.succeeded",
            "data": {
                "object": {
                    "customer": self.student.stripe_customer_id,
                    "payment_method": "pm_456",
                }
            },
        }

        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        pm = PaymentMethod.objects.get(student=self.student)
        paypal = PayPalPaymentMethod.objects.get(payment_method=pm)
        self.assertEqual(paypal.payer_email, "test@example.com")

        mock_modify.assert_called_once()
        mock_update_customer.assert_called_once()

    @patch("plan.payment.views.modify_payment_method")
    @patch("plan.payment.views.update_customer")
    @patch("plan.payment.views.retrieve_payment_method")
    @patch("plan.payment.views.construct_event")
    def test_handle_revolut_payment_method(
        self, mock_construct, mock_retrieve, mock_update_customer, mock_modify
    ):
        mock_retrieve.return_value = {"type": PaymentType.REVOLUT}
        mock_construct.return_value = {
            "type": "setup_intent.succeeded",
            "data": {
                "object": {
                    "customer": self.student.stripe_customer_id,
                    "payment_method": "pm_789",
                }
            },
        }

        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        pm = PaymentMethod.objects.get(student=self.student)
        RevolutPaymentMethod.objects.get(payment_method=pm)  # should exist

        mock_modify.assert_called_once()
        mock_update_customer.assert_called_once()

    @patch("plan.payment.views.modify_payment_method")
    @patch("plan.payment.views.update_customer")
    @patch("plan.payment.views.retrieve_payment_method")
    @patch("plan.payment.views.construct_event")
    def test_handle_unknown_payment_type_logs_error(
        self, mock_construct, mock_retrieve, mock_update_customer, mock_modify
    ):
        mock_retrieve.return_value = {"type": "UNKNOWN"}
        mock_construct.return_value = {
            "type": "setup_intent.succeeded",
            "data": {
                "object": {
                    "customer": self.student.stripe_customer_id,
                    "payment_method": "pm_000",
                }
            },
        }

        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        pm = PaymentMethod.objects.get(student=self.student)
        self.assertEqual(pm.type, "UNKNOWN")
        self.assertFalse(CardPaymentMethod.objects.exists())
        self.assertFalse(PayPalPaymentMethod.objects.exists())
        self.assertFalse(RevolutPaymentMethod.objects.exists())

        mock_modify.assert_called_once()
        mock_update_customer.assert_called_once()

    @patch(
        "plan.payment.views.modify_payment_method",
        side_effect=stripe.error.InvalidRequestError("msg", "param"),
    )
    @patch("plan.payment.views.update_customer")
    @patch("plan.payment.views.retrieve_payment_method")
    @patch("plan.payment.views.construct_event")
    def test_handle_invalid_request_error_does_not_raise(
        self, mock_construct, mock_retrieve, mock_update_customer, mock_modify
    ):
        mock_retrieve.return_value = {"type": PaymentType.REVOLUT}
        mock_construct.return_value = {
            "type": "setup_intent.succeeded",
            "data": {
                "object": {
                    "customer": self.student.stripe_customer_id,
                    "payment_method": "pm_111",
                }
            },
        }

        response = self.client.post(
            self.url, data=b"{}", content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        pm = PaymentMethod.objects.get(student=self.student)
        self.assertEqual(pm.stripe_payment_method_id, "pm_111")
        mock_modify.assert_called_once()
        mock_update_customer.assert_called_once()

    @patch("plan.payment.views.construct_event")
    @patch("plan.payment.views.logger")
    def test_unhandled_event_type_logs_info(self, mock_logger, mock_construct):
        # Return an event with unknown type
        mock_construct.return_value = {
            "type": "random.event",
            "data": {"object": {"id": "obj_123"}},
        }

        response = self.client.post(
            self.url,
            data=b"{}",
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="testsig",
        )

        # Assert response is still OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Assert logger.info was called with correct message
        mock_logger.info.assert_called_once_with("Not handled event_type: random.event")
