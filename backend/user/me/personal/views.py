from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from django.utils.translation import gettext as _
from .serializers import PersonalDataSerializer
from user.type.student_user.models import Student
from utils.stripe.customer import update_customer


class PersonalDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = PersonalDataSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = PersonalDataSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        stripe_customer_id = Student.objects.get(user=user).stripe_customer_id
        if stripe_customer_id:
            update_customer(
                stripe_customer_id,
                name=f"{serializer.data['first_name']} {serializer.data['last_name']}",
                address={
                    "line1": serializer.data.get("street_address", ""),
                    "postal_code": serializer.data.get("zip_code", ""),
                    "city": serializer.data.get("city", ""),
                    "country": serializer.data.get("country", ""),
                },
            )
        return Response(serializer.data, status=status.HTTP_200_OK)
