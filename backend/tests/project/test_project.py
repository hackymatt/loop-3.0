from django.test import TestCase
from django.db.models import Avg, Count
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from review.models import Review
from project.models import Project
from project.enrollment.models import ProjectEnrollment
from project.progress.models import ProjectProgress
from ..factory import create_student, create_project, create_step
from ..helpers import login
from const import Urls, Language, ProjectStatus


class ProjectViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.Project}"

        self.student_1, self.student_1_password = create_student()
        self.student_2, _ = create_student()

        self.project_1 = create_project()
        project_prerequisites = [create_project() for _ in range(3)]
        self.project_1.project_prerequisites.add(*project_prerequisites)

        self.project_2 = create_project()
        self.project_2.steps.clear()
        self.project_2.save()

        self.project_3 = create_project()
        self.project_3.steps.clear()
        step = create_step()
        step.substeps.clear()
        step.save()
        self.project_3.steps.add(step)
        self.project_3.save()

        ProjectProgress.objects.create(
            student=self.student_1,
            completed_at=timezone.now(),
            substep=self.project_1.steps.all()[0].substeps.all()[0],
        )

        self.review_1 = Review.objects.create(
            student=self.student_1,
            project=self.project_1,
            rating=5,
            language=Language.EN,
            comment="Great project!",
        )
        self.review_2 = Review.objects.create(
            student=self.student_2,
            project=self.project_1,
            rating=4,
            language=Language.EN,
            comment="Good project!",
        )
        self.review_3 = Review.objects.create(
            student=self.student_2,
            project=self.project_2,
            rating=3,
            language=Language.EN,
            comment="Good project!",
        )

    def test_list_projects_unauthorized(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 6)
        self.assertEqual(
            response.data["results"][0]["translated_name"],
            self.project_1.get_translation("en").name,
        )

    def test_list_projects_authorized(self):
        login(self, self.student_1.user.email, self.student_1_password)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 6)
        self.assertEqual(
            response.data["results"][0]["translated_name"],
            self.project_1.get_translation("en").name,
        )
        self.assertEqual(
            response.data["results"][0]["progress"],
            float(
                (
                    1
                    / self.project_1.steps.aggregate(total_substeps=Count("substeps"))[
                        "total_substeps"
                    ]
                    or 0
                )
                * 100
            ),
        )

    def test_retrieve_project_by_slug(self):
        login(self, self.student_1.user.email, self.student_1_password)
        response = self.client.get(f"{self.url}/{self.project_3.slug}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["slug"], self.project_3.slug)
        self.assertEqual(
            response.data["translated_overview"],
            self.project_3.get_translation("en").overview,
        )

    def test_retrieve_project_by_slug_unauthorized(self):
        response = self.client.get(f"{self.url}/{self.project_1.slug}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["slug"], self.project_1.slug)
        self.assertEqual(
            response.data["translated_overview"],
            self.project_1.get_translation("en").overview,
        )

    def test_retrieve_project_by_slug_authorized(self):
        login(self, self.student_1.user.email, self.student_1_password)
        response = self.client.get(f"{self.url}/{self.project_1.slug}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["slug"], self.project_1.slug)
        self.assertEqual(
            response.data["translated_overview"],
            self.project_1.get_translation("en").overview,
        )
        self.assertEqual(
            response.data["progress"],
            float(
                (
                    1
                    / self.project_1.steps.aggregate(total_substeps=Count("substeps"))[
                        "total_substeps"
                    ]
                    or 0
                )
                * 100
            ),
        )

    def test_filter_projects_by_technology(self):
        response = self.client.get(
            f"{self.url}?technologies={self.project_1.technology.slug}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["slug"], self.project_1.slug)

    def test_filter_projects_by_minimum_rating(self):
        response = self.client.get(f"{self.url}?rating=4")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_slugs = [project["slug"] for project in response.data["results"]]
        self.assertIn(self.project_1.slug, returned_slugs)
        self.assertNotIn(self.project_2.slug, returned_slugs)

    def test_filter_projects_by_status_unauthorized(self):
        response = self.client.get(f"{self.url}?status={ProjectStatus.NOT_STARTED}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 6)

    def test_filter_projects_by_status_authorized(self):
        login(self, self.student_1.user.email, self.student_1_password)
        response = self.client.get(f"{self.url}?status={ProjectStatus.NOT_STARTED}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)

        response = self.client.get(f"{self.url}?status={ProjectStatus.IN_PROGRESS}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

        response = self.client.get(f"{self.url}?status={ProjectStatus.COMPLETED}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 0)

        response = self.client.get(f"{self.url}?status=invalid")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 6)


class FeaturedProjectsViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.FEATURED_Project}"

        self.student_1, _ = create_student()
        self.student_2, _ = create_student()

        # Create 7 projects with varying ratings, enrollments, and created_at
        self.projects = []
        for i in range(7):
            project = create_project()
            self.projects.append(project)

        # Ratings
        Review.objects.create(project=self.projects[3], rating=5, student=self.student_1)
        Review.objects.create(project=self.projects[2], rating=4, student=self.student_1)
        Review.objects.create(project=self.projects[2], rating=2, student=self.student_2)

        # Enrollments
        ProjectEnrollment.objects.create(project=self.projects[2], student=self.student_1)
        ProjectEnrollment.objects.create(project=self.projects[2], student=self.student_2)
        ProjectEnrollment.objects.create(project=self.projects[3], student=self.student_1)

    def test_view_returns_success(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_view_returns_max_6_unique_projects(self):
        response = self.client.get(self.url)
        self.assertLessEqual(len(response.data), 6)

    def test_projects_include_best_rated(self):
        response = self.client.get(self.url)
        returned_slugs = {project["slug"] for project in response.data}
        best_rated = (
            Project.objects.annotate(avg_rating=Avg("reviews__rating"))
            .filter(avg_rating__isnull=False)
            .order_by("-avg_rating")[:5]
        )

        self.assertTrue(
            any(project.slug in returned_slugs for project in best_rated),
            "None of the best-rated projects were included in the featured projects.",
        )

    def test_projects_include_most_enrolled(self):
        response = self.client.get(self.url)
        returned_slugs = {project["slug"] for project in response.data}
        most_enrolled = Project.objects.annotate(
            enrollment_count=Count("enrollments")
        ).order_by("-enrollment_count")[:5]

        self.assertTrue(
            any(project.slug in returned_slugs for project in most_enrolled),
            "None of the most-enrolled projects were included in the featured projects.",
        )

    def test_projects_include_newest(self):
        response = self.client.get(self.url)
        returned_slugs = {project["slug"] for project in response.data}
        newest = Project.objects.order_by("-created_at")[:5]

        # At least one of the newest projects should be in the result
        self.assertTrue(
            any(project.slug in returned_slugs for project in newest),
            "None of the newest projects were included in the featured projects.",
        )

    def test_projects_are_deduplicated(self):
        # This checks that the result is truly deduplicated
        response = self.client.get(self.url)
        returned_slugs = [project["slug"] for project in response.data]
        self.assertEqual(len(returned_slugs), len(set(returned_slugs)))


class SimilarProjectsViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.SIMILAR_ProjectS}"

        # Create a base project
        self.base_project = create_project()

        # Create similar projects (matching at least one attribute)
        self.similar_1 = create_project()
        self.similar_1.category = self.base_project.category
        self.similar_1.save()

        self.similar_2 = create_project()
        self.similar_2.technology = self.base_project.technology
        self.similar_2.save()

        self.similar_3 = create_project()
        self.similar_3.level = self.base_project.level
        self.similar_3.save()

        # Project that should not be returned
        self.unrelated = create_project()

    def test_view_returns_success(self):
        response = self.client.get(
            self.url.replace("<slug:slug>", self.base_project.slug)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_similar_projects_are_returned(self):
        response = self.client.get(
            self.url.replace("<slug:slug>", self.base_project.slug)
        )
        returned_slugs = {project["slug"] for project in response.data}

        # All returned projects should match at least one attribute
        for project_slug in returned_slugs:
            project = Project.objects.get(slug=project_slug)
            self.assertTrue(
                project.category == self.base_project.category
                or project.technology == self.base_project.technology
                or project.level == self.base_project.level
            )

        # The unrelated project should not be in the results
        self.assertNotIn(self.unrelated.slug, returned_slugs)

    def test_base_project_is_excluded(self):
        response = self.client.get(
            self.url.replace("<slug:slug>", self.base_project.slug)
        )
        returned_slugs = {project["slug"] for project in response.data}
        self.assertNotIn(self.base_project.slug, returned_slugs)

    def test_returns_at_most_three_projects(self):
        response = self.client.get(
            self.url.replace("<slug:slug>", self.base_project.slug)
        )
        self.assertLessEqual(len(response.data), 3)

    def test_returns_empty_if_no_similar(self):
        # Create a project with a unique category, tech, and level
        unique_project = create_project()
        response = self.client.get(self.url.replace("<slug:slug>", unique_project.slug))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
