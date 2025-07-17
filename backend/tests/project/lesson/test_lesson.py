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
    create_substep,
    create_plan,
)
from ...helpers import login
from const import Urls, SubstepType
from unittest.mock import patch, Mock


class SubstepViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON}"

        self.student, self.student_password = create_student()

        self.project = create_project()
        self.step = self.project.steps.all()[0]

        self.reading_substep, self.reading_specific_substep = create_substep(
            SubstepType.READING
        )
        self.video_substep, self.video_specific_substep = create_substep(SubstepType.VIDEO)
        self.quiz_substep, self.quiz_specific_substep = create_substep(SubstepType.QUIZ)
        self.coding_substep, self.coding_specific_substep = create_substep(
            SubstepType.CODING
        )
        self.step.substeps.add(self.reading_substep)
        self.step.substeps.add(self.video_substep)
        self.step.substeps.add(self.quiz_substep)
        self.step.substeps.add(self.coding_substep)
        self.step.save()

        self.paid_plan = create_plan()

    def test_requires_authentication(self):
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:substep_slug>", self.reading_substep.slug)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_successful_retrieve_reading_substep(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:substep_slug>", self.reading_substep.slug)
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
                student=self.student, substep=self.reading_substep
            ).exists()
        )

    def test_successful_retrieve_video_substep(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:substep_slug>", self.video_substep.slug)
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
                student=self.student, substep=self.video_substep
            ).exists()
        )

    def test_successful_retrieve_quiz_substep_not_completed(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:substep_slug>", self.quiz_substep.slug)
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
                student=self.student, substep=self.quiz_substep
            ).exists()
        )

    def test_successful_retrieve_quiz_substep_completed(self):
        login(self, self.student.user.email, self.student_password)
        ProjectProgress.objects.create(
            student=self.student, substep=self.quiz_substep, completed_at=timezone.now()
        )
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:substep_slug>", self.quiz_substep.slug)
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
                student=self.student, substep=self.quiz_substep
            ).exists()
        )

    def test_successful_retrieve_coding_substep_not_completed(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:substep_slug>", self.coding_substep.slug)
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
                student=self.student, substep=self.coding_substep
            ).exists()
        )

    def test_successful_retrieve_coding_substep_not_completed_hint(self):
        login(self, self.student.user.email, self.student_password)
        ProjectProgress.objects.create(
            student=self.student, substep=self.coding_substep, hint_used=True
        )
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:substep_slug>", self.coding_substep.slug)
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
                student=self.student, substep=self.coding_substep
            ).exists()
        )

    def test_successful_retrieve_coding_substep_completed(self):
        login(self, self.student.user.email, self.student_password)
        ProjectProgress.objects.create(
            student=self.student, substep=self.coding_substep, completed_at=timezone.now()
        )
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:substep_slug>", self.coding_substep.slug)
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
                student=self.student, substep=self.coding_substep
            ).exists()
        )

        self.assertEqual(
            response.data["answer"],
            ProjectProgress.objects.filter(
                student=self.student, substep=self.coding_substep
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
            .replace("<slug:substep_slug>", self.reading_substep.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_substep_not_in_step(self):
        login(self, self.student.user.email, self.student_password)

        other_substep, _ = create_substep(SubstepType.READING)

        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:substep_slug>", other_substep.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_default_plan_first_step_allowed(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", self.step.slug)
            .replace("<slug:substep_slug>", self.reading_substep.slug)
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
        other_substep = other_step.substeps.all()[0]

        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", other_step.slug)
            .replace("<slug:substep_slug>", other_substep.slug)
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
        other_substep = other_step.substeps.all()[0]

        response = self.client.get(
            self.url.replace("<slug:project_slug>", self.project.slug)
            .replace("<slug:step_slug>", other_step.slug)
            .replace("<slug:substep_slug>", other_substep.slug)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class SubstepProgressAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON_PROGRESS}"

        self.student, self.student_password = create_student()

        self.project = create_project()
        step = self.project.steps.all()[0]
        self.substep = step.substeps.all()[0]

        self.reading_substep, self.reading_specific_substep = create_substep(
            SubstepType.READING
        )
        self.quiz_substep, self.quiz_specific_substep = create_substep(SubstepType.QUIZ)
        self.coding_substep, self.coding_specific_substep = create_substep(
            SubstepType.CODING
        )
        step.substeps.add(self.quiz_substep)
        step.substeps.add(self.coding_substep)
        step.save()

    def test_post_substep_progress_creates_project_progress(self):
        login(self, self.student.user.email, self.student_password)
        data = {"substep": self.substep.slug, "answer": "Sample answer"}

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        progress = ProjectProgress.objects.filter(
            student=self.student, substep=self.substep
        ).first()
        self.assertIsNotNone(progress)
        self.assertEqual(progress.answer, "Sample answer")

    def test_post_substep_progress_requires_authentication(self):
        data = {"substep": self.substep.slug, "answer": "Sample answer"}

        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_post_substep_progress_invalid_substep(self):
        login(self, self.student.user.email, self.student_password)
        data = {"substep": "non-existing-slug", "answer": "Answer"}

        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class SubstepSubmitAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON_SUBMIT}"

        self.student, self.student_password = create_student()

        self.project = create_project()
        step = self.project.steps.all()[0]
        self.substep = step.substeps.all()[0]

        self.reading_substep, self.reading_specific_substep = create_substep(
            SubstepType.READING
        )
        self.quiz_substep, self.quiz_specific_substep = create_substep(SubstepType.QUIZ)
        self.coding_substep, self.coding_specific_substep = create_substep(
            SubstepType.CODING
        )
        step.substeps.add(self.quiz_substep)
        step.substeps.add(self.coding_substep)
        step.save()

    def test_requires_authentication(self):
        response = self.client.post(self.url, data={})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_successful_quiz_submission(self):
        login(self, self.student.user.email, self.student_password)
        question = self.quiz_specific_substep.get_translation("en").question
        answer = [option.is_correct for option in question.options.all()]
        data = {"substep": self.quiz_substep.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        progress = ProjectProgress.objects.get(
            student=self.student, substep=self.quiz_substep
        )
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(progress.answer, answer)

    def test_invalid_quiz_submission(self):
        login(self, self.student.user.email, self.student_password)
        question = self.quiz_specific_substep.get_translation("en").question
        answer = [not option.is_correct for option in question.options.all()]
        data = {"substep": self.quiz_substep.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_coding_submission(self):
        login(self, self.student.user.email, self.student_password)
        answer = self.coding_specific_substep.file.solution
        data = {"substep": self.coding_substep.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        progress = ProjectProgress.objects.get(
            student=self.student, substep=self.coding_substep
        )
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(progress.answer, answer)

    @patch("project.substep.serializers.requests.post")
    def test_successful_coding_submission_broker_success(self, mock_post):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            "result": {"stdout": "", "stderr": "", "exit_code": 0}
        }

        mock_post.return_value = mock_response

        login(self, self.student.user.email, self.student_password)
        self.coding_specific_substep.file.solution = "a = 10 + 10\nprint(a)"
        self.coding_specific_substep.file.save()
        answer = "a = 5 * 4\nprint(a)"
        data = {"substep": self.coding_substep.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        mock_post.assert_called_once()

        progress = ProjectProgress.objects.get(
            student=self.student, substep=self.coding_substep
        )
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(progress.answer, answer)

    def test_invalid_coding_submission(self):
        login(self, self.student.user.email, self.student_password)
        answer = "incorrect"
        data = {"substep": self.coding_substep.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_coding_submission_no_tests(self):
        login(self, self.student.user.email, self.student_password)
        answer = "incorrect"
        self.coding_specific_substep.test_command = None
        self.coding_specific_substep.save()
        data = {"substep": self.coding_substep.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_coding_submission_tree_error(self):
        login(self, self.student.user.email, self.student_password)
        answer = "def invalid_func(: pass"
        data = {"substep": self.coding_substep.slug, "answer": answer}
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_other_submission(self):
        login(self, self.student.user.email, self.student_password)
        data = {
            "substep": self.reading_substep.slug,
        }
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        progress = ProjectProgress.objects.get(
            student=self.student, substep=self.reading_substep
        )
        self.assertIsNotNone(progress.completed_at)

    def test_substep_not_found(self):
        login(self, self.student.user.email, self.student_password)
        data = {
            "substep": "incorrect",
        }
        response = self.client.post(self.url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class SubstepAnswerAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON_ANSWER}"

        self.student, self.student_password = create_student()

        self.project = create_project()
        step = self.project.steps.all()[0]
        self.substep = step.substeps.all()[0]

        self.reading_substep, self.reading_specific_substep = create_substep(
            SubstepType.READING
        )
        self.quiz_substep, self.quiz_specific_substep = create_substep(SubstepType.QUIZ)
        self.coding_substep, self.coding_specific_substep = create_substep(
            SubstepType.CODING
        )
        step.substeps.add(self.quiz_substep)
        step.substeps.add(self.coding_substep)
        step.save()

    def test_quiz_substep_answer_retrieval(self):
        login(self, self.student.user.email, self.student_password)
        question = self.quiz_specific_substep.get_translation("en").question
        answer = [option.is_correct for option in question.options.all()]
        response = self.client.post(
            self.url, data={"substep": self.quiz_substep.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["answer"], answer)

        progress = ProjectProgress.objects.get(
            student=self.student, substep=self.quiz_substep
        )
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(progress.answer, answer)
        self.assertEqual(progress.points, 0)

    def test_coding_substep_answer_retrieval(self):
        login(self, self.student.user.email, self.student_password)
        answer = self.coding_specific_substep.file.solution
        response = self.client.post(
            self.url, data={"substep": self.coding_substep.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["answer"], answer)

        progress = ProjectProgress.objects.get(
            student=self.student, substep=self.coding_substep
        )
        self.assertEqual(progress.answer, answer)

    def test_other_substep_answer_retrieval(self):
        login(self, self.student.user.email, self.student_password)
        answer = None
        response = self.client.post(
            self.url, data={"substep": self.reading_substep.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["answer"], answer)

        progress = ProjectProgress.objects.get(
            student=self.student, substep=self.reading_substep
        )
        self.assertEqual(progress.answer, answer)

    def test_substep_not_found(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url, data={"substep": "non-existent"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class SubstepHintAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.LESSON_HINT}"

        self.student, self.student_password = create_student()

        self.project = create_project()
        step = self.project.steps.all()[0]
        self.substep = step.substeps.all()[0]

        self.reading_substep, self.reading_specific_substep = create_substep(
            SubstepType.READING
        )
        self.coding_substep, self.coding_specific_substep = create_substep(
            SubstepType.CODING
        )
        step.substeps.add(self.coding_substep)
        step.save()

    def test_post_hint_success(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url, data={"substep": self.coding_substep.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("hint", response.data)
        self.assertEqual(
            response.data["hint"],
            self.coding_specific_substep.get_translation("en").hint,
        )

        project_progress = ProjectProgress.objects.get(
            student=self.student, substep=self.coding_substep
        )
        self.assertTrue(project_progress.hint_used)
        self.assertEqual(
            project_progress.points,
            self.coding_substep.points - self.coding_specific_substep.penalty_points,
        )

    def test_post_hint_not_coding(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url, data={"substep": self.reading_substep.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("hint", response.data)
        self.assertIsNone(response.data["hint"])

        project_progress = ProjectProgress.objects.get(
            student=self.student, substep=self.reading_substep
        )
        self.assertTrue(project_progress.hint_used)
        self.assertEqual(project_progress.points, self.reading_substep.points)

    def test_post_hint_substep_not_found(self):
        login(self, self.student.user.email, self.student_password)
        response = self.client.post(
            self.url, {"substep": "non-existent-substep"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_hint_unauthenticated(self):
        response = self.client.post(
            self.url, data={"substep": self.coding_substep.slug}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
