from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from const import Urls, SubstepType
from certificate.models import Certificate
from project.progress.models import ProjectProgress
from ..factory import (
    create_student,
    create_certificate,
    create_project,
    create_step,
    create_substep,
)
from ..helpers import login


class CertificateViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.CERTIFICATE}"

        self.student_1, self.student_1_password = create_student()
        self.student_2, self.student_2_password = create_student()

        self.certificate_1 = create_certificate()
        self.certificate_1.student = self.student_1
        self.certificate_1.save()

        self.certificate_2 = create_certificate()
        self.certificate_1.student = self.student_1
        self.certificate_1.save()

    def test_retrieve_certificate_public(self):
        response = self.client.get(f"{self.url}/{self.certificate_2.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(self.certificate_2.id))

    def test_list_certificates_authenticated(self):
        login(self, self.student_1.user.email, self.student_1_password)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["id"], str(self.certificate_1.id))

    def test_list_certificates_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProjectCompletionSignalTestCase(TestCase):
    def setUp(self):
        self.student, self.student_password = create_student()

        self.project = create_project()
        self.project.steps.clear()
        step = create_step()
        step.substeps.clear()

        self.substep1, _ = create_substep(SubstepType.READING)
        self.substep2, _ = create_substep(SubstepType.VIDEO)
        self.substep3, _ = create_substep(SubstepType.QUIZ)
        self.substep4, _ = create_substep(SubstepType.CODING)
        step.substeps.add(self.substep1)
        step.substeps.add(self.substep2)
        step.substeps.add(self.substep3)
        step.substeps.add(self.substep4)
        step.save()

        self.project.steps.add(step)
        self.project.save()

    def test_certificate_created_after_all_substeps_completed(self):
        # Initially no certificate
        self.assertFalse(Certificate.objects.exists())

        # Complete the first substep
        ProjectProgress.objects.create(
            student=self.student, substep=self.substep1, completed_at=timezone.now()
        )
        self.assertFalse(Certificate.objects.exists())  # Still incomplete

        # Complete the second substep
        ProjectProgress.objects.create(
            student=self.student, substep=self.substep2, completed_at=timezone.now()
        )
        self.assertFalse(Certificate.objects.exists())  # Still incomplete

        # Complete the third substep
        ProjectProgress.objects.create(
            student=self.student, substep=self.substep3, completed_at=timezone.now()
        )
        self.assertFalse(Certificate.objects.exists())  # Still incomplete

        # Complete the fourth substep
        ProjectProgress.objects.create(
            student=self.student, substep=self.substep4, completed_at=timezone.now()
        )
        self.assertTrue(
            Certificate.objects.filter(
                student=self.student, project=self.project
            ).exists()
        )

    def test_certificate_not_created_if_not_all_substeps_completed(self):
        # Mark only one as completed
        ProjectProgress.objects.create(
            student=self.student, substep=self.substep1, completed_at=timezone.now()
        )
        self.assertFalse(
            Certificate.objects.filter(
                student=self.student, project=self.project
            ).exists()
        )

    def test_certificate_not_duplicated(self):
        # Complete all substeps
        ProjectProgress.objects.create(
            student=self.student, substep=self.substep1, completed_at=timezone.now()
        )
        ProjectProgress.objects.create(
            student=self.student, substep=self.substep2, completed_at=timezone.now()
        )
        ProjectProgress.objects.create(
            student=self.student, substep=self.substep3, completed_at=timezone.now()
        )
        ProjectProgress.objects.create(
            student=self.student, substep=self.substep4, completed_at=timezone.now()
        )

        # There should be only one certificate
        self.assertEqual(
            Certificate.objects.filter(
                student=self.student, project=self.project
            ).count(),
            1,
        )

        # Trigger signal again by updating progress
        progress = ProjectProgress.objects.get(student=self.student, substep=self.substep1)
        progress.save()

        self.assertEqual(
            Certificate.objects.filter(
                student=self.student, project=self.project
            ).count(),
            1,
        )
