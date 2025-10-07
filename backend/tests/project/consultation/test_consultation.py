from unittest.mock import patch
from django.test import TestCase
from rest_framework import status
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from project.consultation.models import Consultation
from plan.subscription.utils import subscribe
from plan.models import Plan
from rest_framework.test import APIClient
from const import Urls, PlanType, SubscriptionStatus
from utils.google.gmail import GmailApi
from ...factory import (
    create_student,
    create_student,
    create_project,
    create_consultation,
)
from ...helpers import login


class ConsultationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.PROJECT_CONSULTATIONS}"

        self.premium_plan = Plan.objects.get(type=PlanType.PREMIUM)
        self.premium_plan.consultation_limit = 2
        self.premium_plan.save()

        self.project = create_project(
            active=True, project_prerequisites=[], blog_prerequisites=[], similar=[]
        )
        self.free_student, self.free_student_password = create_student(is_active=True)
        self.premium_student, self.premium_student_password = create_student(
            is_active=True
        )
        subscribe(
            self.premium_student,
            self.premium_plan,
            timezone.now(),
            SubscriptionStatus.ACTIVE,
            end_date=timezone.now() + relativedelta(months=1),
        )

        self.consultation_1 = create_consultation(
            project=self.project, student=self.premium_student
        )
        self.consultation_2 = create_consultation(project=self.project)
        self.consultation_3 = create_consultation(project=self.project)

    @patch.object(GmailApi, "_send_message")
    def test_create_post_success(self, send_message_mock):
        login(self, self.premium_student.user.email, self.premium_student_password)

        data = {"comment": "Some content"}
        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug), data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Consultation.objects.count(), 4)

        send_message_mock.assert_called_once()

    @patch.object(GmailApi, "_send_message")
    def test_create_post_forbidden_for_non_premium_users(self, send_message_mock):
        login(self, self.free_student.user.email, self.free_student_password)

        data = {"title": "My Post", "message": "Some content"}
        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Consultation.objects.count(), 3)

        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_create_post_limit_exceeded(self, send_message_mock):
        login(self, self.premium_student.user.email, self.premium_student_password)

        create_consultation(project=self.project, student=self.premium_student)

        data = {"comment": "Some content"}
        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug), data
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["root"],
            "Consultations limit exceeded. Please upgrade your plan or wait until next period.",
        )
        self.assertEqual(Consultation.objects.count(), 4)

        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_create_post_limit_incorrect_date(self, send_message_mock):
        login(self, self.premium_student.user.email, self.premium_student_password)

        subscribe(
            self.premium_student,
            self.premium_plan,
            start_date=timezone.now() - relativedelta(days=1),
            status=SubscriptionStatus.ACTIVE,
            end_date=timezone.now() - relativedelta(years=1),
        )

        data = {"comment": "Some content"}
        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug), data
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["root"],
            "Consultations limit exceeded. Please upgrade your plan or wait until next period.",
        )
        self.assertEqual(Consultation.objects.count(), 3)

        send_message_mock.assert_not_called()

    @patch.object(GmailApi, "_send_message")
    def test_create_post_limit_less_than_a_month(self, send_message_mock):
        login(self, self.premium_student.user.email, self.premium_student_password)

        subscribe(
            self.premium_student,
            self.premium_plan,
            start_date=timezone.now(),
            status=SubscriptionStatus.ACTIVE,
            end_date=timezone.now() + relativedelta(days=1),
        )

        data = {"comment": "Some content"}
        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug), data
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["root"],
            "Consultations limit exceeded. Please upgrade your plan or wait until next period.",
        )
        self.assertEqual(Consultation.objects.count(), 3)

        send_message_mock.assert_not_called()
