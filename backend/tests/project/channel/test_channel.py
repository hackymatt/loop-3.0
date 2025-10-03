from django.test import TestCase
from rest_framework import status
from django.utils import timezone
from project.channel.models import ChannelPost, ChannelPostLike, ChannelPostComment
from plan.subscription.utils import subscribe
from rest_framework.test import APIClient
from const import Urls, PlanType, SubscriptionStatus
from ...helpers import login
from ...factory import (
    create_student,
    create_student,
    create_project,
    create_plan,
    create_channel_post,
    create_channel_post_like,
    create_channel_post_comment,
)


class ChannelPostTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.PROJECT_CHANNEL_POSTS}"

        self.paid_plan = create_plan(type=PlanType.PREMIUM)
        self.project = create_project(
            active=True, project_prerequisites=[], blog_prerequisites=[], similar=[]
        )
        self.free_student, self.free_student_password = create_student(is_active=True)
        self.paid_student, self.paid_student_password = create_student(is_active=True)
        subscribe(
            self.paid_student, self.paid_plan, timezone.now(), SubscriptionStatus.ACTIVE
        )

        self.channel_post_1 = create_channel_post(
            project=self.project, student=self.paid_student
        )
        self.channel_post_2 = create_channel_post(project=self.project)
        self.channel_post_3 = create_channel_post(project=self.project)

        create_channel_post_comment(channel_post=self.channel_post_1)

    def test_list_posts_allowed_for_paid_users(self):
        login(self, self.paid_student.user.email, self.paid_student_password)

        response = self.client.get(self.url.replace("<slug:slug>", self.project.slug))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["records_count"], 3)

    def test_list_posts_forbidden_for_free_plan(self):
        login(self, self.free_student.user.email, self.free_student_password)

        response = self.client.get(self.url.replace("<slug:slug>", self.project.slug))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_post_success(self):
        login(self, self.paid_student.user.email, self.paid_student_password)

        data = {"title": "My Post", "message": "Some content"}
        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug), data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ChannelPost.objects.count(), 4)

    def test_create_post_forbidden_for_free_plan(self):
        login(self, self.free_student.user.email, self.free_student_password)

        data = {"title": "My Post", "message": "Some content"}
        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(ChannelPost.objects.count(), 3)

    def test_update_post(self):
        login(self, self.paid_student.user.email, self.paid_student_password)

        data = {"title": "Updated Title", "message": "Updated Content"}
        response = self.client.put(
            f"{self.url}/<int:post_id>".replace(
                "<slug:slug>", self.project.slug
            ).replace("<int:post_id>", str(self.channel_post_1.id)),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.channel_post_1.refresh_from_db()
        self.assertEqual(self.channel_post_1.title, "Updated Title")
        self.assertEqual(self.channel_post_1.message, "Updated Content")

    def test_delete_post(self):
        login(self, self.paid_student.user.email, self.paid_student_password)

        response = self.client.delete(
            f"{self.url}/<int:post_id>".replace(
                "<slug:slug>", self.project.slug
            ).replace("<int:post_id>", str(self.channel_post_1.id))
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ChannelPost.objects.count(), 2)


class ChannelPostCommentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.PROJECT_CHANNEL_POST_COMMENTS}"

        self.paid_plan = create_plan(type=PlanType.PREMIUM)
        self.project = create_project(
            active=True, project_prerequisites=[], blog_prerequisites=[], similar=[]
        )

        self.free_student, self.free_student_password = create_student(is_active=True)
        self.paid_student, self.paid_student_password = create_student(is_active=True)
        self.other_student, self.other_student_password = create_student(is_active=True)

        subscribe(
            self.paid_student, self.paid_plan, timezone.now(), SubscriptionStatus.ACTIVE
        )
        subscribe(
            self.other_student,
            self.paid_plan,
            timezone.now(),
            SubscriptionStatus.ACTIVE,
        )

        self.channel_post = create_channel_post(
            project=self.project, student=self.paid_student
        )
        self.comment = create_channel_post_comment(
            channel_post=self.channel_post, student=self.paid_student
        )

    def test_create_comment_success(self):
        login(self, self.paid_student.user.email, self.paid_student_password)

        data = {"post_id": self.channel_post.id, "message": "My comment"}
        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ChannelPostComment.objects.count(), 2)

    def test_create_comment_forbidden_for_free_user(self):
        login(self, self.free_student.user.email, self.free_student_password)

        data = {"post_id": self.channel_post.id, "message": "Should fail"}
        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_own_comment(self):
        login(self, self.paid_student.user.email, self.paid_student_password)

        data = {"message": "Updated comment"}
        response = self.client.put(
            f"{self.url}/<int:post_id>/<int:comment_id>".replace(
                "<slug:slug>", self.project.slug
            )
            .replace("<int:post_id>", str(self.channel_post.id))
            .replace("<int:comment_id>", str(self.comment.id)),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.message, "Updated comment")

    def test_update_other_comment_forbidden(self):
        login(self, self.other_student.user.email, self.other_student_password)

        data = {"message": "Hacker update"}
        response = self.client.put(
            f"{self.url}/<int:post_id>/<int:comment_id>".replace(
                "<slug:slug>", self.project.slug
            )
            .replace("<int:post_id>", str(self.channel_post.id))
            .replace("<int:comment_id>", str(self.comment.id)),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_own_comment(self):
        login(self, self.paid_student.user.email, self.paid_student_password)

        response = self.client.delete(
            f"{self.url}/<int:post_id>/<int:comment_id>".replace(
                "<slug:slug>", self.project.slug
            )
            .replace("<int:post_id>", str(self.channel_post.id))
            .replace("<int:comment_id>", str(self.comment.id)),
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ChannelPostComment.objects.count(), 0)

    def test_delete_other_comment_forbidden(self):
        login(self, self.other_student.user.email, self.other_student_password)

        response = self.client.delete(
            f"{self.url}/<int:post_id>/<int:comment_id>".replace(
                "<slug:slug>", self.project.slug
            )
            .replace("<int:post_id>", str(self.channel_post.id))
            .replace("<int:comment_id>", str(self.comment.id)),
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(ChannelPostComment.objects.count(), 1)


class ChannelPostLikeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.PROJECT_CHANNEL_POST_LIKES}"

        self.paid_plan = create_plan(type=PlanType.PREMIUM)
        self.project = create_project(
            active=True, project_prerequisites=[], blog_prerequisites=[], similar=[]
        )

        self.free_student, self.free_student_password = create_student(is_active=True)
        self.paid_student, self.paid_student_password = create_student(is_active=True)
        self.other_student, self.other_student_password = create_student(is_active=True)

        subscribe(
            self.paid_student, self.paid_plan, timezone.now(), SubscriptionStatus.ACTIVE
        )
        subscribe(
            self.other_student,
            self.paid_plan,
            timezone.now(),
            SubscriptionStatus.ACTIVE,
        )

        self.channel_post = create_channel_post(
            project=self.project, student=self.other_student
        )

    def test_like_post_success(self):
        login(self, self.paid_student.user.email, self.paid_student_password)

        data = {"post_id": self.channel_post.id}
        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ChannelPostLike.objects.count(), 1)

    def test_toggle_like_removes_existing(self):
        login(self, self.paid_student.user.email, self.paid_student_password)

        create_channel_post_like(
            channel_post=self.channel_post, student=self.paid_student
        )

        data = {"post_id": self.channel_post.id}

        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ChannelPostLike.objects.count(), 0)

    def test_like_forbidden_for_free_user(self):
        login(self, self.free_student.user.email, self.free_student_password)

        data = {"post_id": self.channel_post.id}
        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(ChannelPostLike.objects.count(), 0)

    def test_like_own_post_not_allowed(self):
        login(self, self.other_student.user.email, self.other_student_password)

        data = {"post_id": self.channel_post.id}
        response = self.client.post(
            self.url.replace("<slug:slug>", self.project.slug),
            data,
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(ChannelPostLike.objects.count(), 0)
