from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from datetime import timedelta
from django.utils import timezone
from course.progress.models import CourseProgress
from course.enrollment.models import CourseEnrollment
from course.serializers import CourseListSerializer
from certificate.models import Certificate
from certificate.serializers import CertificateSerializer


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        course_progress = CourseProgress.objects.filter(
            student__user=user, completed_at__isnull=False
        )

        total_points = course_progress.aggregate(Sum("points"))["points__sum"] or 0

        # Get all unique dates of lesson completion
        completed_dates = course_progress.values_list("completed_at", flat=True)
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

        enrollments = CourseEnrollment.objects.filter(student__user=user).order_by(
            "-created_at"
        )[:4]
        courses = [enrollment.course for enrollment in enrollments]

        certificates = Certificate.objects.filter(student__user=user).order_by(
            "-created_at"
        )[:4]

        data = {
            "total_points": total_points,
            "daily_streak": daily_streak,
            "courses": CourseListSerializer(
                courses, many=True, context={"request": request}
            ).data,
            "certificates": CertificateSerializer(
                certificates, many=True, context={"request": request}
            ).data,
        }
        return Response(data, status=status.HTTP_200_OK)
