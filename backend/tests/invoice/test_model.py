from django.test import TestCase
from django.utils import timezone
from unittest.mock import patch
from global_config import CONFIG
from ..factory import create_invoice


class InvoiceModelTests(TestCase):
    def test_invoice_number_autoincrement(self):
        invoice1 = create_invoice(auto_generate=False)
        invoice2 = create_invoice(auto_generate=False)

        self.assertEqual(invoice1.invoice_number, 1)
        self.assertEqual(invoice2.invoice_number, 2)

    def test_invoice_save_triggers_generate_and_send_invoice(self):
        with patch("invoice.models.generate_and_send_invoice") as mocked_generate:
            invoice = create_invoice(auto_generate=True)

            mocked_generate.assert_called_once_with(
                invoice,
                CONFIG["website_url"],
                invoice.customer.full_name,
            )

    def test_invoice_amount_property(self):
        invoice = create_invoice(auto_generate=False)
        items = invoice.items.all()
        amount = sum(item.price * item.quantity for item in items)

        self.assertEqual(invoice.amount, amount)

    def test_invoice_number_not_changed_when_update(self):
        invoice = create_invoice(auto_generate=False)
        invoice_number = invoice.invoice_number

        invoice.service_date = timezone.now()
        invoice.save()

        invoice.refresh_from_db()
        self.assertEqual(invoice_number, invoice.invoice_number)
