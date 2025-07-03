import requests
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from ...utils import get_unique_username, set_cookies, download_and_assign_image
from plan.subscription.utils import subscribe_free_plan
from ..serializers import LoginResponseSerializer
from user.type.student_user.models import Student
from const import JoinType, UserType

github_provider = settings.SOCIALACCOUNT_PROVIDERS.get("github", {})


class GithubLoginView(APIView):
    def post(self, request):
        code = request.data.get("code")  # Frontend should send 'code'

        if not code:
            return Response(
                {"root": _("Code is required")}, status=status.HTTP_400_BAD_REQUEST
            )

        # Exchange code for access token
        token_response = requests.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": github_provider.get("CLIENT_ID", ""),
                "client_secret": github_provider.get("SECRET", ""),
                "code": code,
            },
            headers={"Accept": "application/json"},
        ).json()

        access_token = token_response.get("access_token")

        if not access_token:
            return Response(
                {"root": _("Failed to retrieve access token")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch user data from GitHub API
        github_response = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        ).json()

        email = github_response.get("email")

        # If email is not available in the first response, fetch from /user/emails
        if not email:
            emails_response = requests.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}"},
            ).json()

            # Find primary verified email
            email = next(
                (
                    e["email"]
                    for e in emails_response
                    if e.get("primary") and e.get("verified")
                ),
                None,
            )

        # If no email found, reject the request
        if not email:
            return Response(
                {"root": _("No email found in GitHub account")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = get_unique_username(email.split("@")[0])
        first_name = (
            github_response.get("name", "").split(" ")[0]
            if github_response.get("name")
            else ""
        )
        last_name = (
            github_response.get("name", "").split(" ")[1]
            if github_response.get("name")
            and len(github_response["name"].split(" ")) > 1
            else ""
        )
        picture = github_response.get("avatar_url", "")

        # Create user or get existing one
        user, user_created = get_user_model().objects.get_or_create(
            email=email,
            defaults={
                "username": username,
                "first_name": first_name,
                "last_name": last_name,
                "user_type": UserType.STUDENT,
                "join_type": JoinType.GITHUB,
                "is_active": True,
            },
        )
        student, student_created = Student.objects.get_or_create(user=user)

        if user_created:
            subscribe_free_plan(student)
            download_and_assign_image(user, picture)

        # Create JWT tokens
        refresh_token = RefreshToken.for_user(user)
        access_token = refresh_token.access_token

        response = Response(
            LoginResponseSerializer(user, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

        return set_cookies(response, access_token, refresh_token)
