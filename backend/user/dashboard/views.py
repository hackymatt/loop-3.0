from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from datetime import timedelta
from django.utils import timezone
from project.progress.models import ProjectProgress
from project.enrollment.models import ProjectEnrollment
from project.serializers import ProjectListSerializer
from certificate.models import Certificate
from certificate.serializers import CertificateSerializer


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        project_progress = ProjectProgress.objects.filter(
            student__user=user, completed_at__isnull=False
        )

        total_points = project_progress.aggregate(Sum("step__points"))["step__points__sum"] or 0

        # Get all unique dates of step completion
        completed_dates = project_progress.values_list("completed_at", flat=True)
        completed_dates = set(date.date() for date in completed_dates)

        today = timezone.now().date()
        yesterday = today - timedelta(days=1)

        daily_streak = 0

        if completed_dates:
            streak = 0
            current_date = today

            # If nothing is completed today, pretend it's yesterday to preserve streak
            if current_date not in completed_dates:
                current_date = yesterday

            # Count streak backwards from current_date
            while current_date in completed_dates:
                streak += 1
                current_date -= timedelta(days=1)

            daily_streak = streak

        enrollments = ProjectEnrollment.objects.filter(student__user=user).order_by(
            "-created_at"
        )[:4]
        projects = [enrollment.project for enrollment in enrollments]

        certificates = Certificate.objects.filter(student__user=user).order_by(
            "-created_at"
        )[:4]

        data = {
            "total_points": total_points,
            "daily_streak": daily_streak,
            "projects": ProjectListSerializer(
                projects, many=True, context={"request": request}
            ).data,
            "certificates": CertificateSerializer(
                certificates, many=True, context={"request": request}
            ).data,
        }
        return Response(data, status=status.HTTP_200_OK)
