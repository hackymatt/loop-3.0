from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from mailer.mailer import Mailer
from utils.url.url import get_website_url
from global_config import CONFIG


class ContactView(APIView):
    http_method_names = ["post"]
    permission_classes = [AllowAny]  # Allow access without authentication

    def post(self, request):
        contact_data = request.data

        website_url = get_website_url(request)
        mailer = Mailer(website_url)
        mailer.send(
            email_template="contact.html",
            to=[CONFIG["contact_email"]],
            subject="Nowa wiadomość ze strony",
            data=contact_data,
        )

        return Response(status=status.HTTP_200_OK, data=contact_data)
