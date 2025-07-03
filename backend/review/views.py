from rest_framework import viewsets, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from review.serializers import (
    ReviewSummarySerializer,
    ReviewSerializer,
    ReviewSubmitSerializer,
)
from .models import Review
from django.db.models import Count, functions
from course.models import Course
from django.shortcuts import get_object_or_404
from user.type.student_user.models import Student


class ReviewSummaryViewSet(viewsets.ViewSet):
    http_method_names = ["get"]

    def list(self, request, slug=None):
        """
        Get the review summary (rating counts) for a specific course based on the slug.
        """
        course = Course.objects.filter(slug=slug).first()
        if not course:
            return Response({}, status=404)

        # Get the review summary for the course
        review_summary = (
            Review.objects.filter(course=course)
            .values("rating")
            .annotate(count=Count("rating"))
            .order_by("rating")
        )

        # Serialize and return the data
        serializer = ReviewSummarySerializer(review_summary, many=True)
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    http_method_names = ["get"]  # Only allow GET requests
    serializer_class = ReviewSerializer

    def get_queryset(self):
        course_slug = self.kwargs["slug"]
        course = get_object_or_404(Course, slug=course_slug, active=True)
        return Review.objects.filter(course=course).order_by("-created_at")


class FeaturedReviewsView(views.APIView):
    def get(self, request):
        lang = request.LANGUAGE_CODE
        reviews = (
            Review.objects.filter(rating=5, language=lang)
            .annotate(comment_length=functions.Length("comment"))
            .select_related("course", "student", "student__user")
            .order_by("-comment_length")
        )
        serializer = ReviewSerializer(reviews, many=True, context={"request": request})
        return Response(serializer.data)


class SubmitReviewView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = get_object_or_404(Student, user=request.user)
        slug = request.data.get("slug")
        course = get_object_or_404(Course, slug=slug, active=True)

        rating = request.data.get("rating")
        comment = request.data.get("comment", "")
        language = request.LANGUAGE_CODE

        serializer = ReviewSubmitSerializer(
            data={"rating": rating, "comment": comment, "language": language}
        )
        serializer.is_valid(raise_exception=True)

        # update_or_create logika
        review, created = Review.objects.update_or_create(
            student=student,
            course=course,
            defaults={"rating": rating, "comment": comment, "language": language},
        )

        return Response(
            ReviewSubmitSerializer(review).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
