import os
from django.test import TestCase
from unittest.mock import patch

from invoice.utils import (
    InvoiceGenerator,
    generate_and_send_invoice,
    send_payment_failed_email,
    send_cancel_email,
    get_invoice_number,
)
from ..factory import create_invoice, create_student


class InvoiceUtilsTests(TestCase):
    def test_get_invoice_number_format(self):
        self.assertEqual(get_invoice_number(1), "LOOPINV0000001")
        self.assertEqual(get_invoice_number(123), "LOOPINV0000123")

    def test_invoice_generator_create_pdf(self):
        invoice = create_invoice()

        generator = InvoiceGenerator(invoice, "http://testserver")

        with patch("invoice.generator.HTML") as mock_html:
            mock_instance = mock_html.return_value
            mock_instance.write_pdf.return_value = None

            path = generator.create()

            self.assertEqual(os.path.basename(path), f"{generator.invoice_number}.pdf")
            mock_instance.write_pdf.assert_called_once()

    def test_generate_and_send_invoice_calls_mailer(self):
        invoice = create_invoice()

        with (
            patch("invoice.utils.Mailer.send") as mock_send,
            patch("invoice.utils.InvoiceGenerator.create", return_value="invoice.pdf"),
            patch(
                "invoice.utils.InvoiceGenerator.upload",
                return_value="http://storage/invoice.pdf",
            ),
            patch("invoice.utils.InvoiceGenerator.remove") as mock_remove,
        ):
            generate_and_send_invoice(invoice, "http://testserver", "Alice")

            mock_send.assert_called_once()
            mock_remove.assert_called_once()

    def test_send_payment_failed_email_sends(self):
        student, _ = create_student(is_active=True)

        with patch("invoice.utils.Mailer.send") as mock_send:
            send_payment_failed_email(
                student, student.user.email, "http://testserver", "en"
            )
            mock_send.assert_called_once()
            args, kwargs = mock_send.call_args
            self.assertEqual(kwargs["email_template"], "payment_failed.html")
            self.assertIn("Payment Failed", kwargs["subject"])

    def test_send_cancel_email_sends(self):
        student, _ = create_student(is_active=True)

        with patch("invoice.utils.Mailer.send") as mock_send:
            send_cancel_email(student, student.user.email, "http://testserver", "en")
            mock_send.assert_called_once()
            args, kwargs = mock_send.call_args
            self.assertEqual(kwargs["email_template"], "subscription_cancelled.html")
            self.assertIn("Subscription Canceled", kwargs["subject"])
