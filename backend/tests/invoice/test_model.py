from django.test import TestCase
from unittest.mock import patch
from global_config import CONFIG
from ..factory import create_invoice


class InvoiceModelTests(TestCase):
    def test_invoice_number_autoincrement(self):
        invoice1 = create_invoice()
        invoice2 = create_invoice()

        self.assertEqual(invoice1.invoice_number, 1)
        self.assertEqual(invoice2.invoice_number, 2)

    def test_invoice_save_triggers_generate_and_send_invoice(self):
        with patch("invoices.models.generate_and_send_invoice") as mocked_generate:
            invoice = create_invoice()

            mocked_generate.assert_called_once_with(
                invoice,
                CONFIG["website_url"],
                invoice.customer.full_name,
            )

    def test_invoice_amount_property(self):
        invoice = create_invoice()
        items = invoice.items.all()
        amount = sum(item.price for item in items)

        self.assertEqual(invoice.amount, amount)
