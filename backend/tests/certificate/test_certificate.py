from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from const import Urls, LessonType
from certificate.models import Certificate
from course.progress.models import CourseProgress
from ..factory import (
    create_student,
    create_certificate,
    create_course,
    create_chapter,
    create_lesson,
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


class CourseCompletionSignalTestCase(TestCase):
    def setUp(self):
        self.student, self.student_password = create_student()

        self.course = create_course()
        self.course.chapters.clear()
        chapter = create_chapter()
        chapter.lessons.clear()

        self.lesson1, _ = create_lesson(LessonType.READING)
        self.lesson2, _ = create_lesson(LessonType.VIDEO)
        self.lesson3, _ = create_lesson(LessonType.QUIZ)
        self.lesson4, _ = create_lesson(LessonType.CODING)
        chapter.lessons.add(self.lesson1)
        chapter.lessons.add(self.lesson2)
        chapter.lessons.add(self.lesson3)
        chapter.lessons.add(self.lesson4)
        chapter.save()

        self.course.chapters.add(chapter)
        self.course.save()

    def test_certificate_created_after_all_lessons_completed(self):
        # Initially no certificate
        self.assertFalse(Certificate.objects.exists())

        # Complete the first lesson
        CourseProgress.objects.create(
            student=self.student, lesson=self.lesson1, completed_at=timezone.now()
        )
        self.assertFalse(Certificate.objects.exists())  # Still incomplete

        # Complete the second lesson
        CourseProgress.objects.create(
            student=self.student, lesson=self.lesson2, completed_at=timezone.now()
        )
        self.assertFalse(Certificate.objects.exists())  # Still incomplete

        # Complete the third lesson
        CourseProgress.objects.create(
            student=self.student, lesson=self.lesson3, completed_at=timezone.now()
        )
        self.assertFalse(Certificate.objects.exists())  # Still incomplete

        # Complete the fourth lesson
        CourseProgress.objects.create(
            student=self.student, lesson=self.lesson4, completed_at=timezone.now()
        )
        self.assertTrue(
            Certificate.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )

    def test_certificate_not_created_if_not_all_lessons_completed(self):
        # Mark only one as completed
        CourseProgress.objects.create(
            student=self.student, lesson=self.lesson1, completed_at=timezone.now()
        )
        self.assertFalse(
            Certificate.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )

    def test_certificate_not_duplicated(self):
        # Complete all lessons
        CourseProgress.objects.create(
            student=self.student, lesson=self.lesson1, completed_at=timezone.now()
        )
        CourseProgress.objects.create(
            student=self.student, lesson=self.lesson2, completed_at=timezone.now()
        )
        CourseProgress.objects.create(
            student=self.student, lesson=self.lesson3, completed_at=timezone.now()
        )
        CourseProgress.objects.create(
            student=self.student, lesson=self.lesson4, completed_at=timezone.now()
        )

        # There should be only one certificate
        self.assertEqual(
            Certificate.objects.filter(
                student=self.student, course=self.course
            ).count(),
            1,
        )

        # Trigger signal again by updating progress
        progress = CourseProgress.objects.get(student=self.student, lesson=self.lesson1)
        progress.save()

        self.assertEqual(
            Certificate.objects.filter(
                student=self.student, course=self.course
            ).count(),
            1,
        )
