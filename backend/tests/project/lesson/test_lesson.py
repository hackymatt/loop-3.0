from django.test import TestCase
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from rest_framework.test import APIClient
from rest_framework import status
from project.enrollment.models import ProjectEnrollment, ProjectStepEnrollment
from project.progress.models import ProjectProgress
from plan.subscription.utils import subscribe
from ...factory import (
    create_student,
    create_project,
    create_step,
    create_step,
    create_plan,
)
from ...helpers import login
from const import Urls, StepType
from unittest.mock import patch, Mock


class StepViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON}"

        self.student, self.student_password = create_student()

        self.project = create_project()
        self.step = self.project.steps.all()[0]

        self.reading_step, self.reading_specific_step = create_step(
            StepType.READING
        )
        self.video_step, self.video_specific_step = create_step(StepType.VIDEO)
        self.quiz_step, self.quiz_specific_step = create_step(StepType.QUIZ)
        self.coding_step, self.coding_specific_step = create_step(
            StepType.CODING
        )
        self.step.steps.add(self.reading_step)
        self.step.steps.add(self.video_step)
        self.step.steps.add(self.quiz_step)
        self.step.steps.add(self.coding_step)
        self.step.save()

        self.paid_plan = create_plan()

    def test_requires_authentication(self):
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:step_slug>", self.reading_step.slug)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_successful_retrieve_reading_step(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:step_slug>", self.reading_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data)
        self.assertIn("points", response.data)
        self.assertIn("name", response.data)
        self.assertIn("text", response.data)

        # Ensure progress and enrollment were created
        self.assertTrue(
            ProjectEnrollment.objects.filter(
                student=self.student, project=self.project
            ).exists()
        )
        self.assertTrue(
            ProjectProgress.objects.filter(
                student=self.student, step=self.reading_step
            ).exists()
        )

    def test_successful_retrieve_video_step(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:step_slug>", self.video_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data)
        self.assertIn("points", response.data)
        self.assertIn("name", response.data)
        self.assertIn("video_url", response.data)

        # Ensure progress and enrollment were created
        self.assertTrue(
            ProjectEnrollment.objects.filter(
                student=self.student, project=self.project
            ).exists()
        )
        self.assertTrue(
            ProjectProgress.objects.filter(
                student=self.student, step=self.video_step
            ).exists()
        )

    def test_successful_retrieve_quiz_step_not_completed(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:step_slug>", self.quiz_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data)
        self.assertIn("points", response.data)
        self.assertIn("name", response.data)
        self.assertIn("question", response.data)
        self.assertIn("answer", response.data)

        # Ensure progress and enrollment were created
        self.assertTrue(
            ProjectEnrollment.objects.filter(
                student=self.student, project=self.project
            ).exists()
        )
        self.assertTrue(
            ProjectProgress.objects.filter(
                student=self.student, step=self.quiz_step
            ).exists()
        )

    def test_successful_retrieve_quiz_step_completed(self):
        login(self, self.student.user.email, self.student_password)
        ProjectProgress.objects.create(
            student=self.student, step=self.quiz_step, completed_at=timezone.now()
        )
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:step_slug>", self.quiz_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data)
        self.assertIn("points", response.data)
        self.assertIn("name", response.data)
        self.assertIn("question", response.data)
        self.assertIn("answer", response.data)

        # Ensure progress and enrollment were created
        self.assertTrue(
            ProjectEnrollment.objects.filter(
                student=self.student, project=self.project
            ).exists()
        )
        self.assertTrue(
            ProjectProgress.objects.filter(
                student=self.student, step=self.quiz_step
            ).exists()
        )

    def test_successful_retrieve_coding_step_not_completed(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:step_slug>", self.coding_step.slug)
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
            ProjectEnrollment.objects.filter(
                student=self.student, project=self.project
            ).exists()
        )
        self.assertTrue(
            ProjectProgress.objects.filter(
                student=self.student, step=self.coding_step
            ).exists()
        )

    def test_successful_retrieve_coding_step_not_completed_hint(self):
        login(self, self.student.user.email, self.student_password)
        ProjectProgress.objects.create(
            student=self.student, step=self.coding_step, hint_used=True
        )
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:step_slug>", self.coding_step.slug)
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
            ProjectEnrollment.objects.filter(
                student=self.student, project=self.project
            ).exists()
        )
        self.assertTrue(
            ProjectProgress.objects.filter(
                student=self.student, step=self.coding_step
            ).exists()
        )

    def test_successful_retrieve_coding_step_completed(self):
        login(self, self.student.user.email, self.student_password)
        ProjectProgress.objects.create(
            student=self.student, step=self.coding_step, completed_at=timezone.now()
        )
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:step_slug>", self.coding_step.slug)
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
            ProjectEnrollment.objects.filter(
                student=self.student, project=self.project
            ).exists()
        )
        self.assertTrue(
            ProjectProgress.objects.filter(
                student=self.student, step=self.coding_step
            ).exists()
        )

        self.assertEqual(
            response.data["answer"],
            ProjectProgress.objects.filter(
                student=self.student, step=self.coding_step
            )
            .first()
            .answer,
        )

    def test_step_not_in_project(self):
        login(self, self.student.user.email, self.student_password)

        other_step = create_step()

        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", other_step.slug)
            .replace("<slug:step_slug>", self.reading_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_step_not_in_step(self):
        login(self, self.student.user.email, self.student_password)

        other_step, _ = create_step(StepType.READING)

        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:step_slug>", other_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_default_plan_first_step_allowed(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:step_slug>", self.reading_step.slug)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_default_plan_second_step_forbidden(self):
        login(self, self.student.user.email, self.student_password)

        ProjectStepEnrollment.objects.create(
            student=self.student, project=self.project, step=self.step
        )

        other_step = create_step()
        self.project.steps.add(other_step)
        self.project.save()
        other_step = other_step.steps.all()[0]

        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", other_step.slug)
            .replace("<slug:step_slug>", other_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_paid_plan_second_step_allowed(self):
        login(self, self.student.user.email, self.student_password)
        subscribe(
            student=self.student,
            plan=self.paid_plan,
            end_date=timezone.now() + relativedelta(years=1),
        )

        ProjectStepEnrollment.objects.create(
            student=self.student, project=self.project, step=self.step
        )

        other_step = create_step()
        self.project.steps.add(other_step)
        self.project.save()
        other_step = other_step.steps.all()[0]

        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", other_step.slug)
            .replace("<slug:step_slug>", other_step.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class StepProgressAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON_PROGRESS}"

        self.student, self.student_password = create_student()

        self.project = create_project()
        step = self.project.steps.all()[0]
        self.step = step.steps.all()[0]

        self.reading_step, self.reading_specific_step = create_step(
            StepType.READING
        )
        self.quiz_step, self.quiz_specific_step = create_step(StepType.QUIZ)
        self.coding_step, self.coding_specific_step = create_step(
            StepType.CODING
        )
        step.steps.add(self.quiz_step)
        step.steps.add(self.coding_step)
        step.save()

    def test_post_step_progress_creates_project_progress(self):
        login(self, self.student.user.email, self.student_password)
        data = {"step": self.step.slug, "answer": "Sample answer"}

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        progress = ProjectProgress.objects.filter(
            student=self.student, step=self.step
        ).first()
        self.assertIsNotNone(progress)
        self.assertEqual(progress.answer, "Sample answer")

    def test_post_step_progress_requires_authentication(self):
        data = {"step": self.step.slug, "answer": "Sample answer"}

        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_post_step_progress_invalid_step(self):
        login(self, self.student.user.email, self.student_password)
        data = {"step": "non-existing-slug", "answer": "Answer"}

        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class StepSubmitAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON_SUBMIT}"

        self.student, self.student_password = create_student()

        self.project = create_project()
        step = self.project.steps.all()[0]
        self.step = step.steps.all()[0]

        self.reading_step, self.reading_specific_step = create_step(
            StepType.READING
        )
        self.quiz_step, self.quiz_specific_step = create_step(StepType.QUIZ)
        self.coding_step, self.coding_specific_step = create_step(
            StepType.CODING
        )
        step.steps.add(self.quiz_step)
        step.steps.add(self.coding_step)
        step.save()

    def test_requires_authentication(self):
        response = self.client.post(self.url, data={})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_successful_quiz_submission(self):
        login(self, self.student.user.email, self.student_password)
        question = self.quiz_specific_step.get_translation("en").question
        answer = [option.is_correct for option in question.options.all()]
        data = {"step": self.quiz_step.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        progress = ProjectProgress.objects.get(
            student=self.student, step=self.quiz_step
        )
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(progress.answer, answer)

    def test_invalid_quiz_submission(self):
        login(self, self.student.user.email, self.student_password)
        question = self.quiz_specific_step.get_translation("en").question
        answer = [not option.is_correct for option in question.options.all()]
        data = {"step": self.quiz_step.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_coding_submission(self):
        login(self, self.student.user.email, self.student_password)
        answer = self.coding_specific_step.file.solution
        data = {"step": self.coding_step.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        progress = ProjectProgress.objects.get(
            student=self.student, step=self.coding_step
        )
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(progress.answer, answer)

    @patch("project.step.serializers.requests.post")
    def test_successful_coding_submission_broker_success(self, mock_post):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            "result": {"stdout": "", "stderr": "", "exit_code": 0}
        }

        mock_post.return_value = mock_response

        login(self, self.student.user.email, self.student_password)
        self.coding_specific_step.file.solution = "a = 10 + 10\nprint(a)"
        self.coding_specific_step.file.save()
        answer = "a = 5 * 4\nprint(a)"
        data = {"step": self.coding_step.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        mock_post.assert_called_once()

        progress = ProjectProgress.objects.get(
            student=self.student, step=self.coding_step
        )
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(progress.answer, answer)

    def test_invalid_coding_submission(self):
        login(self, self.student.user.email, self.student_password)
        answer = "incorrect"
        data = {"step": self.coding_step.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_coding_submission_no_tests(self):
        login(self, self.student.user.email, self.student_password)
        answer = "incorrect"
        self.coding_specific_step.test_command = None
        self.coding_specific_step.save()
        data = {"step": self.coding_step.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_coding_submission_tree_error(self):
        login(self, self.student.user.email, self.student_password)
        answer = "def invalid_func(: pass"
        data = {"step": self.coding_step.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_other_submission(self):
        login(self, self.student.user.email, self.student_password)
        data = {
            "step": self.reading_step.slug,
        }
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        progress = ProjectProgress.objects.get(
            student=self.student, step=self.reading_step
        )
        self.assertIsNotNone(progress.completed_at)

    def test_step_not_found(self):
        login(self, self.student.user.email, self.student_password)
        data = {
            "step": "incorrect",
        }
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class StepAnswerAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON_ANSWER}"

        self.student, self.student_password = create_student()

        self.project = create_project()
        step = self.project.steps.all()[0]
        self.step = step.steps.all()[0]

        self.reading_step, self.reading_specific_step = create_step(
            StepType.READING
        )
        self.quiz_step, self.quiz_specific_step = create_step(StepType.QUIZ)
        self.coding_step, self.coding_specific_step = create_step(
            StepType.CODING
        )
        step.steps.add(self.quiz_step)
        step.steps.add(self.coding_step)
        step.save()

    def test_quiz_step_answer_retrieval(self):
        login(self, self.student.user.email, self.student_password)
        question = self.quiz_specific_step.get_translation("en").question
        answer = [option.is_correct for option in question.options.all()]
        response = self.client.post(
            self.url, data={"step": self.quiz_step.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["answer"], answer)

        progress = ProjectProgress.objects.get(
            student=self.student, step=self.quiz_step
        )
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(progress.answer, answer)
        self.assertEqual(progress.points, 0)

    def test_coding_step_answer_retrieval(self):
        login(self, self.student.user.email, self.student_password)
        answer = self.coding_specific_step.file.solution
        response = self.client.post(
            self.url, data={"step": self.coding_step.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["answer"], answer)

        progress = ProjectProgress.objects.get(
            student=self.student, step=self.coding_step
        )
        self.assertEqual(progress.answer, answer)

    def test_other_step_answer_retrieval(self):
        login(self, self.student.user.email, self.student_password)
        answer = None
        response = self.client.post(
            self.url, data={"step": self.reading_step.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["answer"], answer)

        progress = ProjectProgress.objects.get(
            student=self.student, step=self.reading_step
        )
        self.assertEqual(progress.answer, answer)

    def test_step_not_found(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url, data={"step": "non-existent"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class StepHintAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON_HINT}"

        self.student, self.student_password = create_student()

        self.project = create_project()
        step = self.project.steps.all()[0]
        self.step = step.steps.all()[0]

        self.reading_step, self.reading_specific_step = create_step(
            StepType.READING
        )
        self.coding_step, self.coding_specific_step = create_step(
            StepType.CODING
        )
        step.steps.add(self.coding_step)
        step.save()

    def test_post_hint_success(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url, data={"step": self.coding_step.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("hint", response.data)
        self.assertEqual(
            response.data["hint"],
            self.coding_specific_step.get_translation("en").hint,
        )

        project_progress = ProjectProgress.objects.get(
            student=self.student, step=self.coding_step
        )
        self.assertTrue(project_progress.hint_used)
        self.assertEqual(
            project_progress.points,
            self.coding_step.points - self.coding_specific_step.penalty_points,
        )

    def test_post_hint_not_coding(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url, data={"step": self.reading_step.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("hint", response.data)
        self.assertIsNone(response.data["hint"])

        project_progress = ProjectProgress.objects.get(
            student=self.student, step=self.reading_step
        )
        self.assertTrue(project_progress.hint_used)
        self.assertEqual(project_progress.points, self.reading_step.points)

    def test_post_hint_step_not_found(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url, {"step": "non-existent-step"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_hint_unauthenticated(self):
        response = self.client.post(
            self.url, data={"step": self.coding_step.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
