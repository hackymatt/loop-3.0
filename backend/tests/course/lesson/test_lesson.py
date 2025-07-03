from django.test import TestCase
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from rest_framework.test import APIClient
from rest_framework import status
from course.enrollment.models import CourseEnrollment, CourseChapterEnrollment
from course.progress.models import CourseProgress
from plan.subscription.utils import subscribe
from ...factory import (
    create_student,
    create_course,
    create_chapter,
    create_lesson,
    create_plan,
)
from ...helpers import login
from const import Urls, LessonType
from unittest.mock import patch, Mock


class LessonViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON}"

        self.student, self.student_password = create_student()

        self.course = create_course()
        self.chapter = self.course.chapters.all()[0]

        self.reading_lesson, self.reading_specific_lesson = create_lesson(
            LessonType.READING
        )
        self.video_lesson, self.video_specific_lesson = create_lesson(LessonType.VIDEO)
        self.quiz_lesson, self.quiz_specific_lesson = create_lesson(LessonType.QUIZ)
        self.coding_lesson, self.coding_specific_lesson = create_lesson(
            LessonType.CODING
        )
        self.chapter.lessons.add(self.reading_lesson)
        self.chapter.lessons.add(self.video_lesson)
        self.chapter.lessons.add(self.quiz_lesson)
        self.chapter.lessons.add(self.coding_lesson)
        self.chapter.save()

        self.paid_plan = create_plan()

    def test_requires_authentication(self):
        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", self.chapter.slug)
            .replace("<slug:lesson_slug>", self.reading_lesson.slug)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_successful_retrieve_reading_lesson(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", self.chapter.slug)
            .replace("<slug:lesson_slug>", self.reading_lesson.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data)
        self.assertIn("points", response.data)
        self.assertIn("name", response.data)
        self.assertIn("text", response.data)

        # Ensure progress and enrollment were created
        self.assertTrue(
            CourseEnrollment.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )
        self.assertTrue(
            CourseProgress.objects.filter(
                student=self.student, lesson=self.reading_lesson
            ).exists()
        )

    def test_successful_retrieve_video_lesson(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", self.chapter.slug)
            .replace("<slug:lesson_slug>", self.video_lesson.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data)
        self.assertIn("points", response.data)
        self.assertIn("name", response.data)
        self.assertIn("video_url", response.data)

        # Ensure progress and enrollment were created
        self.assertTrue(
            CourseEnrollment.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )
        self.assertTrue(
            CourseProgress.objects.filter(
                student=self.student, lesson=self.video_lesson
            ).exists()
        )

    def test_successful_retrieve_quiz_lesson_not_completed(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", self.chapter.slug)
            .replace("<slug:lesson_slug>", self.quiz_lesson.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data)
        self.assertIn("points", response.data)
        self.assertIn("name", response.data)
        self.assertIn("question", response.data)
        self.assertIn("answer", response.data)

        # Ensure progress and enrollment were created
        self.assertTrue(
            CourseEnrollment.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )
        self.assertTrue(
            CourseProgress.objects.filter(
                student=self.student, lesson=self.quiz_lesson
            ).exists()
        )

    def test_successful_retrieve_quiz_lesson_completed(self):
        login(self, self.student.user.email, self.student_password)
        CourseProgress.objects.create(
            student=self.student, lesson=self.quiz_lesson, completed_at=timezone.now()
        )
        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", self.chapter.slug)
            .replace("<slug:lesson_slug>", self.quiz_lesson.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data)
        self.assertIn("points", response.data)
        self.assertIn("name", response.data)
        self.assertIn("question", response.data)
        self.assertIn("answer", response.data)

        # Ensure progress and enrollment were created
        self.assertTrue(
            CourseEnrollment.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )
        self.assertTrue(
            CourseProgress.objects.filter(
                student=self.student, lesson=self.quiz_lesson
            ).exists()
        )

    def test_successful_retrieve_coding_lesson_not_completed(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", self.chapter.slug)
            .replace("<slug:lesson_slug>", self.coding_lesson.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data)
        self.assertIn("points", response.data)
        self.assertIn("name", response.data)
        self.assertIn("introduction", response.data)
        self.assertIn("instructions", response.data)
        self.assertIn("technology", response.data)
        self.assertIn("file", response.data)
        self.assertIn("files", response.data)
        self.assertIn("timeout", response.data)
        self.assertIn("command", response.data)
        self.assertIn("penalty_points", response.data)
        self.assertIn("answer", response.data)

        # Ensure progress and enrollment were created
        self.assertTrue(
            CourseEnrollment.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )
        self.assertTrue(
            CourseProgress.objects.filter(
                student=self.student, lesson=self.coding_lesson
            ).exists()
        )

    def test_successful_retrieve_coding_lesson_not_completed_hint(self):
        login(self, self.student.user.email, self.student_password)
        CourseProgress.objects.create(
            student=self.student, lesson=self.coding_lesson, hint_used=True
        )
        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", self.chapter.slug)
            .replace("<slug:lesson_slug>", self.coding_lesson.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data)
        self.assertIn("points", response.data)
        self.assertIn("name", response.data)
        self.assertIn("introduction", response.data)
        self.assertIn("instructions", response.data)
        self.assertIn("technology", response.data)
        self.assertIn("file", response.data)
        self.assertIn("files", response.data)
        self.assertIn("timeout", response.data)
        self.assertIn("command", response.data)
        self.assertIn("penalty_points", response.data)
        self.assertIn("hint", response.data)

        # Ensure progress and enrollment were created
        self.assertTrue(
            CourseEnrollment.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )
        self.assertTrue(
            CourseProgress.objects.filter(
                student=self.student, lesson=self.coding_lesson
            ).exists()
        )

    def test_successful_retrieve_coding_lesson_completed(self):
        login(self, self.student.user.email, self.student_password)
        CourseProgress.objects.create(
            student=self.student, lesson=self.coding_lesson, completed_at=timezone.now()
        )
        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", self.chapter.slug)
            .replace("<slug:lesson_slug>", self.coding_lesson.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data)
        self.assertIn("points", response.data)
        self.assertIn("name", response.data)
        self.assertIn("introduction", response.data)
        self.assertIn("instructions", response.data)
        self.assertIn("technology", response.data)
        self.assertIn("file", response.data)
        self.assertIn("files", response.data)
        self.assertIn("timeout", response.data)
        self.assertIn("command", response.data)
        self.assertIn("penalty_points", response.data)
        self.assertIn("answer", response.data)

        # Ensure progress and enrollment were created
        self.assertTrue(
            CourseEnrollment.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )
        self.assertTrue(
            CourseProgress.objects.filter(
                student=self.student, lesson=self.coding_lesson
            ).exists()
        )

        self.assertEqual(
            response.data["answer"],
            CourseProgress.objects.filter(
                student=self.student, lesson=self.coding_lesson
            )
            .first()
            .answer,
        )

    def test_chapter_not_in_course(self):
        login(self, self.student.user.email, self.student_password)

        other_chapter = create_chapter()

        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", other_chapter.slug)
            .replace("<slug:lesson_slug>", self.reading_lesson.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_lesson_not_in_chapter(self):
        login(self, self.student.user.email, self.student_password)

        other_lesson, _ = create_lesson(LessonType.READING)

        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", self.chapter.slug)
            .replace("<slug:lesson_slug>", other_lesson.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_default_plan_first_chapter_allowed(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", self.chapter.slug)
            .replace("<slug:lesson_slug>", self.reading_lesson.slug)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_default_plan_second_chapter_forbidden(self):
        login(self, self.student.user.email, self.student_password)

        CourseChapterEnrollment.objects.create(
            student=self.student, course=self.course, chapter=self.chapter
        )

        other_chapter = create_chapter()
        self.course.chapters.add(other_chapter)
        self.course.save()
        other_lesson = other_chapter.lessons.all()[0]

        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", other_chapter.slug)
            .replace("<slug:lesson_slug>", other_lesson.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_paid_plan_second_chapter_allowed(self):
        login(self, self.student.user.email, self.student_password)
        subscribe(
            student=self.student,
            plan=self.paid_plan,
            end_date=timezone.now() + relativedelta(years=1),
        )

        CourseChapterEnrollment.objects.create(
            student=self.student, course=self.course, chapter=self.chapter
        )

        other_chapter = create_chapter()
        self.course.chapters.add(other_chapter)
        self.course.save()
        other_lesson = other_chapter.lessons.all()[0]

        response = self.client.get(
            self.url.replace("<slug:course_slug>", self.course.slug)
            .replace("<slug:chapter_slug>", other_chapter.slug)
            .replace("<slug:lesson_slug>", other_lesson.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class LessonProgressAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON_PROGRESS}"

        self.student, self.student_password = create_student()

        self.course = create_course()
        chapter = self.course.chapters.all()[0]
        self.lesson = chapter.lessons.all()[0]

        self.reading_lesson, self.reading_specific_lesson = create_lesson(
            LessonType.READING
        )
        self.quiz_lesson, self.quiz_specific_lesson = create_lesson(LessonType.QUIZ)
        self.coding_lesson, self.coding_specific_lesson = create_lesson(
            LessonType.CODING
        )
        chapter.lessons.add(self.quiz_lesson)
        chapter.lessons.add(self.coding_lesson)
        chapter.save()

    def test_post_lesson_progress_creates_course_progress(self):
        login(self, self.student.user.email, self.student_password)
        data = {"lesson": self.lesson.slug, "answer": "Sample answer"}

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        progress = CourseProgress.objects.filter(
            student=self.student, lesson=self.lesson
        ).first()
        self.assertIsNotNone(progress)
        self.assertEqual(progress.answer, "Sample answer")

    def test_post_lesson_progress_requires_authentication(self):
        data = {"lesson": self.lesson.slug, "answer": "Sample answer"}

        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_post_lesson_progress_invalid_lesson(self):
        login(self, self.student.user.email, self.student_password)
        data = {"lesson": "non-existing-slug", "answer": "Answer"}

        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class LessonSubmitAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON_SUBMIT}"

        self.student, self.student_password = create_student()

        self.course = create_course()
        chapter = self.course.chapters.all()[0]
        self.lesson = chapter.lessons.all()[0]

        self.reading_lesson, self.reading_specific_lesson = create_lesson(
            LessonType.READING
        )
        self.quiz_lesson, self.quiz_specific_lesson = create_lesson(LessonType.QUIZ)
        self.coding_lesson, self.coding_specific_lesson = create_lesson(
            LessonType.CODING
        )
        chapter.lessons.add(self.quiz_lesson)
        chapter.lessons.add(self.coding_lesson)
        chapter.save()

    def test_requires_authentication(self):
        response = self.client.post(self.url, data={})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_successful_quiz_submission(self):
        login(self, self.student.user.email, self.student_password)
        question = self.quiz_specific_lesson.get_translation("en").question
        answer = [option.is_correct for option in question.options.all()]
        data = {"lesson": self.quiz_lesson.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        progress = CourseProgress.objects.get(
            student=self.student, lesson=self.quiz_lesson
        )
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(progress.answer, answer)

    def test_invalid_quiz_submission(self):
        login(self, self.student.user.email, self.student_password)
        question = self.quiz_specific_lesson.get_translation("en").question
        answer = [not option.is_correct for option in question.options.all()]
        data = {"lesson": self.quiz_lesson.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_coding_submission(self):
        login(self, self.student.user.email, self.student_password)
        answer = self.coding_specific_lesson.file.solution
        data = {"lesson": self.coding_lesson.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        progress = CourseProgress.objects.get(
            student=self.student, lesson=self.coding_lesson
        )
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(progress.answer, answer)

    @patch("course.lesson.serializers.requests.post")
    def test_successful_coding_submission_broker_success(self, mock_post):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            "result": {"stdout": "", "stderr": "", "exit_code": 0}
        }

        mock_post.return_value = mock_response

        login(self, self.student.user.email, self.student_password)
        self.coding_specific_lesson.file.solution = "a = 10 + 10\nprint(a)"
        self.coding_specific_lesson.file.save()
        answer = "a = 5 * 4\nprint(a)"
        data = {"lesson": self.coding_lesson.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        mock_post.assert_called_once()

        progress = CourseProgress.objects.get(
            student=self.student, lesson=self.coding_lesson
        )
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(progress.answer, answer)

    def test_invalid_coding_submission(self):
        login(self, self.student.user.email, self.student_password)
        answer = "incorrect"
        data = {"lesson": self.coding_lesson.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_coding_submission_no_tests(self):
        login(self, self.student.user.email, self.student_password)
        answer = "incorrect"
        self.coding_specific_lesson.test_command = None
        self.coding_specific_lesson.save()
        data = {"lesson": self.coding_lesson.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_coding_submission_tree_error(self):
        login(self, self.student.user.email, self.student_password)
        answer = "def invalid_func(: pass"
        data = {"lesson": self.coding_lesson.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_other_submission(self):
        login(self, self.student.user.email, self.student_password)
        data = {
            "lesson": self.reading_lesson.slug,
        }
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        progress = CourseProgress.objects.get(
            student=self.student, lesson=self.reading_lesson
        )
        self.assertIsNotNone(progress.completed_at)

    def test_lesson_not_found(self):
        login(self, self.student.user.email, self.student_password)
        data = {
            "lesson": "incorrect",
        }
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class LessonAnswerAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON_ANSWER}"

        self.student, self.student_password = create_student()

        self.course = create_course()
        chapter = self.course.chapters.all()[0]
        self.lesson = chapter.lessons.all()[0]

        self.reading_lesson, self.reading_specific_lesson = create_lesson(
            LessonType.READING
        )
        self.quiz_lesson, self.quiz_specific_lesson = create_lesson(LessonType.QUIZ)
        self.coding_lesson, self.coding_specific_lesson = create_lesson(
            LessonType.CODING
        )
        chapter.lessons.add(self.quiz_lesson)
        chapter.lessons.add(self.coding_lesson)
        chapter.save()

    def test_quiz_lesson_answer_retrieval(self):
        login(self, self.student.user.email, self.student_password)
        question = self.quiz_specific_lesson.get_translation("en").question
        answer = [option.is_correct for option in question.options.all()]
        response = self.client.post(
            self.url, data={"lesson": self.quiz_lesson.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["answer"], answer)

        progress = CourseProgress.objects.get(
            student=self.student, lesson=self.quiz_lesson
        )
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(progress.answer, answer)
        self.assertEqual(progress.points, 0)

    def test_coding_lesson_answer_retrieval(self):
        login(self, self.student.user.email, self.student_password)
        answer = self.coding_specific_lesson.file.solution
        response = self.client.post(
            self.url, data={"lesson": self.coding_lesson.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["answer"], answer)

        progress = CourseProgress.objects.get(
            student=self.student, lesson=self.coding_lesson
        )
        self.assertEqual(progress.answer, answer)

    def test_other_lesson_answer_retrieval(self):
        login(self, self.student.user.email, self.student_password)
        answer = None
        response = self.client.post(
            self.url, data={"lesson": self.reading_lesson.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["answer"], answer)

        progress = CourseProgress.objects.get(
            student=self.student, lesson=self.reading_lesson
        )
        self.assertEqual(progress.answer, answer)

    def test_lesson_not_found(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url, data={"lesson": "non-existent"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class LessonHintAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON_HINT}"

        self.student, self.student_password = create_student()

        self.course = create_course()
        chapter = self.course.chapters.all()[0]
        self.lesson = chapter.lessons.all()[0]

        self.reading_lesson, self.reading_specific_lesson = create_lesson(
            LessonType.READING
        )
        self.coding_lesson, self.coding_specific_lesson = create_lesson(
            LessonType.CODING
        )
        chapter.lessons.add(self.coding_lesson)
        chapter.save()

    def test_post_hint_success(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url, data={"lesson": self.coding_lesson.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("hint", response.data)
        self.assertEqual(
            response.data["hint"],
            self.coding_specific_lesson.get_translation("en").hint,
        )

        course_progress = CourseProgress.objects.get(
            student=self.student, lesson=self.coding_lesson
        )
        self.assertTrue(course_progress.hint_used)
        self.assertEqual(
            course_progress.points,
            self.coding_lesson.points - self.coding_specific_lesson.penalty_points,
        )

    def test_post_hint_not_coding(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url, data={"lesson": self.reading_lesson.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("hint", response.data)
        self.assertIsNone(response.data["hint"])

        course_progress = CourseProgress.objects.get(
            student=self.student, lesson=self.reading_lesson
        )
        self.assertTrue(course_progress.hint_used)
        self.assertEqual(course_progress.points, self.reading_lesson.points)

    def test_post_hint_lesson_not_found(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url, {"lesson": "non-existent-lesson"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_hint_unauthenticated(self):
        response = self.client.post(
            self.url, data={"lesson": self.coding_lesson.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
