import os
from weasyprint import HTML

from django.template.loader import render_to_string
from django.utils.translation import gettext as _
from django.utils import translation
from mailer.mailer import Mailer
from datetime import date, datetime, timedelta

from django.core.files.storage import get_storage_class
from utils.logger.logger import logger
from global_config import CONFIG


def get_invoice_number(self, id: int):
    return "LOOPINV{:07d}".format(id)


class InvoiceGenerator:
    def __init__(self, invoice, website_url):
        self.url = website_url
        self.language = invoice.language

        self.INVOICE_DIR = "invoices"

        self.invoice = invoice
        self.customer = invoice.customer
        self.items = invoice.items.all()

        self.amount = self.invoice.amount

        self.date = date.today()
        self.is_vat = self._is_vat()
        self.vat_rate = CONFIG["vat_rate"] if self.is_vat else 0
        self.invoice_number = get_invoice_number(self.invoice.invoice_number)

        self.filename = f"{self.invoice_number}.pdf"
        self.path = os.path.join(self.INVOICE_DIR, self.filename)

        with translation.override(invoice.language):
            self.payment_method = _(self.invoice.method)
            self.payment_status = _(self.invoice.status)

        self.data = {
            "vat": self.is_vat,
            "invoice_date": self.invoice.invoice_date,
            "service_date": self.invoice.service_date,
            "invoice_number": self.invoice_number,
            "customer": {
                "full_name": self.customer.full_name,
                "street": self.customer.street_address,
                "city": self.customer.city,
                "zip_code": self.customer.zip_code,
                "country": self.customer.country,
            },
            "products": [
                {
                    "id": self._format_id(id=item.id),
                    "name": item.name,
                    "quantity": item.quantity,
                    "price_netto": self._format_number(
                        number=self._calc_net_price(price=item.price)
                    ),
                    "subtotal_netto": self._format_number(
                        number=self._calc_net_subtotal(
                            price=item.price, quantity=item.quantity
                        )
                    ),
                    "vat_percent": f"{self.vat_rate}%",
                    "vat": self._format_number(number=self._calc_vat(price=item.price)),
                    "price_brutto": self._format_number(number=item.price),
                    "subtotal_brutto": self._format_number(
                        number=item.price * item.quantity
                    ),
                }
                for item in self.items
            ],
            "total_netto": self._format_price(
                price=self._calc_net_price(price=self.amount)
            ),
            "total_vat": self._format_price(price=self._calc_vat(price=self.amount)),
            "total_brutto": self._format_price(price=self.amount),
            "payment_due": self.date + timedelta(days=14),
            "payment_method": self.payment_method,
            "payment_status": self.payment_status,
            "notes": self.invoice.notes,
        }

        os.makedirs(self.INVOICE_DIR, mode=0o777, exist_ok=True)

    def _format_id(self, id: int):
        return "{:07d}".format(id)

    def _calc_net_price(self, price: float):
        return float(price) * (1 - self.vat_rate / 100)

    def _calc_net_subtotal(self, price: float, quantity: int):
        return self._calc_net_price(price=price) * quantity

    def _calc_vat(self, price: float):
        return float(price) * (self.vat_rate / 100)

    def _format_number(self, number: float):
        return f"{float(number):,.2f}"

    def _format_price(self, price: float):
        currency = self.invoice.currency
        return f"{float(price):,.2f} {currency}"

    def _calc_sales(self):
        from invoice.models import Invoice

        current_year = datetime.now().year
        previous_year = current_year - 1
        start_date = date(previous_year, 1, 1)
        end_date = date(previous_year, 12, 31)
        sales = Invoice.objects.filter(created_at__date__range=(start_date, end_date))
        total_sales = sum(invoice.amount for invoice in sales) if sales.exists() else 0
        return total_sales

    def _is_vat(self):
        return self._calc_sales() > CONFIG["vat_limit"]

    def create(self):
        with translation.override(self.language):
            html_content = render_to_string(
                "invoice.html",
                {
                    **self.data,
                    "company": "loop",
                },
            )

        HTML(string=html_content, base_url=self.url).write_pdf(
            self.path, presentational_hints=True
        )

        return self.path

    def _upload(self, storage, location):  # pragma: no cover
        if CONFIG["is_local"]:
            logger.warning("Invoice upload has been skipped", exc_info=True)
            return None

        with open(self.path, "rb") as f:
            return storage.save(location, f)

    def upload(self):
        bucket_name = datetime.today().strftime("%Y%m%d")
        invoices_storage_config = CONFIG["storages"].get(
            "invoices",
            {
                "BACKEND": "storages.backends.s3.S3Storage",
                "OPTIONS": {},
            },
        )
        storage_class = get_storage_class(invoices_storage_config["BACKEND"])
        storage = storage_class(**invoices_storage_config["OPTIONS"])
        location = f"{bucket_name}/{self.filename}"

        file_path = self._upload(storage=storage, location=location)

        return storage.url(file_path) if file_path else None

    def remove(self):
        if os.path.exists(self.path):
            os.remove(self.path)


def generate_and_send_invoice(invoice, website_url, first_name):
    invoice_generator = InvoiceGenerator(invoice, website_url)
    invoice_path = invoice_generator.create()

    mailer = Mailer(website_url)

    with translation.override(invoice.language):
        subject = _("Payment confirmation")
        message_1 = _(
            "Hi %(first_name)s, we have successfully received your payment."
        ) % {"first_name": first_name}
        message_2 = _("Payment details:")
        message_3 = _("Invoice Number:")
        message_4 = _("Amount:")
        message_5 = _("Payment Method:")
        message_6 = _("Status:")
        message_7 = _("The invoice is attached.")

        data = {
            "message_1": message_1,
            "message_2": message_2,
            "message_3": message_3,
            "invoice_number": get_invoice_number(invoice.id),
            "message_4": message_4,
            "amount": f"{invoice.amount} {invoice.currency}",
            "message_5": message_5,
            "payment_method": _(invoice.method),
            "message_6": message_6,
            "payment_status": _(invoice.status),
            "message_7": message_7,
        }

    mailer.send(
        email_template="payment_confirmation.html",
        to=[invoice.customer.email],
        subject=subject,
        data=data,
        attachments=[invoice_path],
        language=invoice.language,
    )

    invoice_generator.remove()
