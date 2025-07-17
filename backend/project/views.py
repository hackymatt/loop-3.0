from rest_framework import viewsets, views
from rest_framework.response import Response
from .models import Project
from .step.models import Step
from blog.models import Blog
from .serializers import ProjectListSerializer, ProjectRetrieveSerializer
from .filters import ProjectFilter
from rest_framework.permissions import AllowAny
from django.db.models import Count, Avg, Sum, Q, Prefetch
from django.shortcuts import get_object_or_404


class ProjectViewSet(viewsets.ModelViewSet):
    http_method_names = ["get"]
    filterset_class = ProjectFilter
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Project.objects.prefetch_related(
                "instructors",
                "translations",
                Prefetch(
                    "steps",
                    queryset=Step.objects.prefetch_related("substeps").order_by(
                        "projectstep__order"
                    ),
                ),
                Prefetch(
                    "project_prerequisites",
                    queryset=Project.objects.prefetch_related("translations"),
                ),
                Prefetch(
                    "blog_prerequisites",
                    queryset=Blog.objects.prefetch_related("translations"),
                ),
            )
            .annotate(
                substeps_count=Count("steps__substeps", distinct=True),
                average_rating=Avg("reviews__rating"),
                ratings_count=Count("reviews", distinct=True),
                students_count=Count("enrollments", distinct=True),
                points=Sum("steps__substeps__points"),
            )
            .order_by("slug")
        )

    def get_serializer_class(self):
        return (
            ProjectListSerializer if self.action == "list" else ProjectRetrieveSerializer
        )


class FeaturedProjectsView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Best rated (at least one review)
        best_rated = (
            Project.objects.annotate(avg_rating=Avg("reviews__rating"))
            .filter(avg_rating__isnull=False)
            .order_by("-avg_rating")[:5]
        )

        # Most enrolled
        most_enrolled = Project.objects.annotate(
            enrollment_count=Count("enrollments")
        ).order_by("-enrollment_count")[:5]

        # Newest
        newest = Project.objects.order_by("-created_at")[:5]

        # Merge all projects, deduplicate by ID
        all_projects = list(best_rated) + list(most_enrolled) + list(newest)
        unique_projects = list({project.id: project for project in all_projects}.values())[
            :6
        ]

        serializer = ProjectListSerializer(
            unique_projects, many=True, context={"request": request}
        )
        return Response(serializer.data)


class SimilarProjectsView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        project = get_object_or_404(Project, slug=slug, active=True)

        similar_projects = (
            Project.objects.filter(
                Q(category=project.category)
                | Q(technology=project.technology)
                | Q(level=project.level)
            )
            .exclude(id=project.id)
            .distinct()[:3]
        )

        serializer = ProjectListSerializer(
            similar_projects, many=True, context={"request": request}
        )
        return Response(serializer.data)
