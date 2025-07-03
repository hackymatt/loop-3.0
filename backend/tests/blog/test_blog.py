from django.test import TestCase
from rest_framework.test import APIClient
from blog.models import Blog
from rest_framework import status
from django.utils import timezone
from const import Urls
from ..factory import create_blog, create_admin, create_student


class BlogViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.POST}"

        # First blog post
        self.blog1 = create_blog()
        self.blog1.published_at = self.blog1.published_at - timezone.timedelta(weeks=1)
        self.blog1.visits = 5
        self.blog1.save()

        # Second blog post
        self.blog2 = create_blog()
        self.blog2.visits = 10
        self.blog2.save()

        self.admin, self.admin_password = create_admin()
        self.student, self.student_password = create_student()

    def test_blog_list(self):
        # Test the list view of BlogViewSet
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["slug"], self.blog1.slug)

    def test_blog_list_with_no_most_visited(self):
        # Deactivate all blogs to simulate no most_visited blog
        Blog.objects.all().update(active=False)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"], [])

    def test_blog_detail(self):
        # Test the detail view of BlogViewSet
        response = self.client.get(f"{self.url}/{self.blog1.slug}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["slug"], self.blog1.slug)
        self.assertEqual(
            response.data["translated_name"], self.blog1.get_translation("en").name
        )
        self.assertEqual(
            response.data["translated_description"],
            self.blog1.get_translation("en").description,
        )

    def test_blog_filter_by_category(self):
        # Test filtering blogs by category (topic)
        response = self.client.get(f"{self.url}?category={self.blog1.topic.slug}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_blog_filter_by_tags(self):
        # Test filtering blogs by tags
        response = self.client.get(f"{self.url}?tags={self.blog1.tags.all()[0].slug}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_blog_list_with_invalid_filter(self):
        # Use an invalid filter parameter, e.g., "invalid_param"
        response = self.client.get(f"{self.url}?invalid_param=value")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Ensure the original queryset is returned despite the invalid filter
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["slug"], self.blog1.slug)

    def test_blog_most_visited(self):
        # Test to see if the most visited blog is excluded from the recent blogs list
        self.blog1.visits = 10
        self.blog1.save()

        # Add another blog with fewer visits
        another_blog = create_blog()
        another_blog.visits = 5
        another_blog.save()

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(response.data["results"]), 2
        )  # The most visited blog should be excluded
        self.assertEqual(response.data["results"][1]["slug"], another_blog.slug)


class RecentBlogsViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.RECENT_POST}"  # adjust to your actual RecentBlogsView URL

        # First blog post
        self.blog1 = create_blog()
        self.blog1.published_at = self.blog1.published_at - timezone.timedelta(weeks=1)
        self.blog1.visits = 20
        self.blog1.save()

        # Second blog post
        self.blog2 = create_blog()
        self.blog2.visits = 5
        self.blog2.save()

        # Third blog post
        self.blog3 = create_blog()
        self.blog3.visits = 7
        self.blog3.save()

        self.admin, self.admin_password = create_admin()
        self.student, self.student_password = create_student()

    def test_recent_blogs_excludes_most_visited(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        returned_slugs = [blog["slug"] for blog in response.data]
        self.assertNotIn(self.blog1.slug, returned_slugs)
        self.assertIn(self.blog2.slug, returned_slugs)
        self.assertIn(self.blog3.slug, returned_slugs)

    def test_recent_blogs_returns_up_to_five(self):
        # Create 4 more recent blogs to reach 6 total (1 will be excluded)
        for i in range(4):
            blog = create_blog()
            blog.published_at = timezone.now() - timezone.timedelta(days=i + 3)
            blog.save()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)  # limited to 5, most visited excluded

    def test_recent_blogs_when_no_active_blogs(self):
        Blog.objects.all().update(active=False)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])  # no active blogs means empty list


class FeaturedBlogViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = f"/{Urls.API}/{Urls.FEATURED_POST}"  # replace with your actual featured blog endpoint

        # First blog post
        self.blog1 = create_blog()
        self.blog1.published_at = self.blog1.published_at - timezone.timedelta(weeks=1)
        self.blog1.visits = 5
        self.blog1.save()

        # Second blog post
        self.blog2 = create_blog()
        self.blog2.visits = 10
        self.blog2.save()

        self.admin, self.admin_password = create_admin()
        self.student, self.student_password = create_student()

    def test_featured_blog_is_most_visited(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["slug"], self.blog2.slug)
        self.assertEqual(
            response.data[0]["translated_name"], self.blog2.get_translation("en").name
        )

    def test_featured_blog_when_no_blogs(self):
        Blog.objects.all().delete()

        response = self.client.get(self.url)
        # Adjust this part depending on your API's actual behavior
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            [],
        )
