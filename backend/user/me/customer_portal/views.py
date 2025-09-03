from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from plan.payment.utils import generate_customer_portal_link
from utils.url.url import get_website_url
from user.type.student_user.models import Student


class CustomerPortalLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        student = Student.objects.get(user=request.user)
        website_url = get_website_url(request)
        url = generate_customer_portal_link(student, website_url)
        return Response({"url": url}, status=status.HTTP_200_OK)
