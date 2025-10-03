from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
import stripe
from ....factory import create_payment_method
from ....helpers import login
from const import Urls, PaymentType
from plan.payment.models import PaymentMethod


class PaymentMethodViewSetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.PAYMENT_METHODS}"

        (
            self.payment_method,
            self.specific_payment_method,
            self.student_password,
        ) = create_payment_method(type=PaymentType.CARD)
        self.payment_method_2, _, _ = create_payment_method(
            student=self.payment_method.student,
            student_password=self.student_password,
            type=PaymentType.PAYPAL,
        )
        self.payment_method_3, _, _ = create_payment_method(
            student=self.payment_method.student,
            student_password=self.student_password,
            type=PaymentType.REVOLUT,
        )
        self.payment_method_4, _, _ = create_payment_method(
            student=self.payment_method.student,
            student_password=self.student_password,
            type=PaymentType.CARD,
        )
        self.payment_method_5, _, _ = create_payment_method(
            student=self.payment_method.student,
            student_password=self.student_password,
            type=PaymentType.PAYPAL,
        )

    def test_list_payment_methods(self):
        login(self, self.payment_method.student.user.email, self.student_password)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["records_count"], 5)

    @patch("user.me.payment.views.update_customer")
    def test_update_sets_default_success(self, mock_update_customer):
        login(self, self.payment_method.student.user.email, self.student_password)
        response = self.client.put(f"{self.url}/{self.payment_method.id}", {})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment_method.refresh_from_db()
        self.assertTrue(self.payment_method.is_default)
        mock_update_customer.assert_called_once_with(
            self.payment_method.student.stripe_customer_id,
            invoice_settings={
                "default_payment_method": self.payment_method.stripe_payment_method_id
            },
        )

    @patch(
        "user.me.payment.views.update_customer",
        side_effect=stripe.error.StripeError("fail"),
    )
    def test_update_stripe_error(self, mock_update_customer):
        login(self, self.payment_method.student.user.email, self.student_password)
        response = self.client.put(f"{self.url}/{self.payment_method.id}", {})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_destroy_default_payment_method(self):
        login(self, self.payment_method.student.user.email, self.student_password)
        self.payment_method.is_default = True
        self.payment_method.save()

        response = self.client.delete(f"{self.url}/{self.payment_method.id}")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    @patch("user.me.payment.views.detach_payment_method")
    def test_destroy_non_default_success(self, mock_detach):
        login(self, self.payment_method.student.user.email, self.student_password)

        self.payment_method.is_default = False
        self.payment_method.save()
        response = self.client.delete(f"{self.url}/{self.payment_method.id}")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        mock_detach.assert_called_once_with(
            self.payment_method.stripe_payment_method_id
        )
        self.assertFalse(
            PaymentMethod.objects.filter(id=self.payment_method.id).exists()
        )

    @patch(
        "user.me.payment.views.detach_payment_method",
        side_effect=stripe.error.StripeError("fail"),
    )
    def test_destroy_stripe_error(self, mock_detach):
        login(self, self.payment_method.student.user.email, self.student_password)

        self.payment_method.is_default = False
        self.payment_method.save()

        response = self.client.delete(f"{self.url}/{self.payment_method.id}")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

        mock_detach.assert_called_once_with(
            self.payment_method.stripe_payment_method_id
        )
