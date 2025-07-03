from rest_framework import viewsets, views
from rest_framework.response import Response
from .models import Course
from .chapter.models import Chapter
from .serializers import CourseListSerializer, CourseRetrieveSerializer
from .filters import CourseFilter
from rest_framework.permissions import AllowAny
from django.db.models import Count, Avg, Sum, Q, Prefetch
from django.shortcuts import get_object_or_404
from const import LessonType


class CourseViewSet(viewsets.ModelViewSet):
    http_method_names = ["get"]
    filterset_class = CourseFilter
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Course.objects.prefetch_related(
                "instructors",
                "translations",
                Prefetch(
                    "chapters",
                    queryset=Chapter.objects.prefetch_related("lessons").order_by(
                        "coursechapter__order"
                    ),
                ),
                Prefetch(
                    "prerequisites",
                    queryset=Course.objects.prefetch_related("translations"),
                ),
            )
            .annotate(
                lessons_count=Count("chapters__lessons", distinct=True),
                average_rating=Avg("reviews__rating"),
                ratings_count=Count("reviews", distinct=True),
                students_count=Count("enrollments", distinct=True),
                points=Sum("chapters__lessons__points"),
                reading_count=Count(
                    "chapters__lessons",
                    filter=Q(chapters__lessons__type=LessonType.READING),
                    distinct=True,
                ),
                video_count=Count(
                    "chapters__lessons",
                    filter=Q(chapters__lessons__type=LessonType.VIDEO),
                    distinct=True,
                ),
                quiz_count=Count(
                    "chapters__lessons",
                    filter=Q(chapters__lessons__type=LessonType.QUIZ),
                    distinct=True,
                ),
                coding_count=Count(
                    "chapters__lessons",
                    filter=Q(chapters__lessons__type=LessonType.CODING),
                    distinct=True,
                ),
            )
            .order_by("slug")
        )

    def get_serializer_class(self):
        return (
            CourseListSerializer if self.action == "list" else CourseRetrieveSerializer
        )


class FeaturedCoursesView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Best rated (at least one review)
        best_rated = (
            Course.objects.annotate(avg_rating=Avg("reviews__rating"))
            .filter(avg_rating__isnull=False)
            .order_by("-avg_rating")[:5]
        )

        # Most enrolled
        most_enrolled = Course.objects.annotate(
            enrollment_count=Count("enrollments")
        ).order_by("-enrollment_count")[:5]

        # Newest
        newest = Course.objects.order_by("-created_at")[:5]

        # Merge all courses, deduplicate by ID
        all_courses = list(best_rated) + list(most_enrolled) + list(newest)
        unique_courses = list({course.id: course for course in all_courses}.values())[
            :6
        ]

        serializer = CourseListSerializer(
            unique_courses, many=True, context={"request": request}
        )
        return Response(serializer.data)


class SimilarCoursesView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        course = get_object_or_404(Course, slug=slug, active=True)

        similar_courses = (
            Course.objects.filter(
                Q(category=course.category)
                | Q(technology=course.technology)
                | Q(level=course.level)
            )
            .exclude(id=course.id)
            .distinct()[:3]
        )

        serializer = CourseListSerializer(
            similar_courses, many=True, context={"request": request}
        )
        return Response(serializer.data)
