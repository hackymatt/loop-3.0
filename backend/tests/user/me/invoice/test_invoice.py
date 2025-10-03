from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from ....factory import create_student_invoice
from ....helpers import login
from const import Urls


class InvoicesViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.INVOICES}"

        self.invoice, self.student_password = create_student_invoice()

    def test_list_invoices_authenticated(self):
        login(self, self.invoice.student.user.email, self.student_password)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["records_count"], 1)
        self.assertEqual(
            response.data["results"][0]["invoice_number"], "LOOPINV0000001"
        )

    def test_retrieve_invoice_authenticated(self):
        login(self, self.invoice.student.user.email, self.student_password)
        response = self.client.get(f"{self.url}/{self.invoice.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["invoice_number"], "LOOPINV0000001")

    def test_list_invoices_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
