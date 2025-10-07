from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import ConsultationSerializer
from .utils import is_user_within_consultation_limit, send_confirmation_email
from project.models import Project
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext as _
from user.type.student_user.models import Student


class ConsultationViewSet(viewsets.ModelViewSet):
    http_method_names = ["post"]
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        student = Student.objects.get(user=request.user)

        # Plan check: limit access for non premium users
        if not student.current_subscription.plan.is_premium:
            return Response({}, status=status.HTTP_403_FORBIDDEN)

        if not is_user_within_consultation_limit(user=request.user):
            return Response(
                {
                    "root": _(
                        "Consultations limit exceeded. Please upgrade your plan or wait until next period."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        project_slug = self.kwargs["slug"]
        project = get_object_or_404(Project, slug=project_slug, active=True)

        serializer = ConsultationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        consultation_instance = serializer.save(student=student, project=project)

        # send email
        send_confirmation_email(request, request.user, consultation_instance.id)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
