from rest_framework import viewsets, views
from rest_framework.response import Response
from .models import Project
from .stage.models import Stage
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
                    "stages",
                    queryset=Stage.objects.prefetch_related("steps").order_by(
                        "projectstage__order"
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
                Prefetch(
                    "similar",
                    queryset=Project.objects.prefetch_related("translations"),
                ),
            )
            .annotate(
                stages_count=Count(
                    "stages", filter=Q(stages__active=True), distinct=True
                ),
                average_rating=Avg("reviews__rating"),
                ratings_count=Count("reviews", distinct=True),
                students_count=Count("enrollments", distinct=True),
                points=Sum(
                    "stages__steps__points", filter=Q(stages__steps__active=True)
                ),
                duration=Sum(
                    "stages__steps__duration", filter=Q(stages__steps__active=True)
                ),
            )
            .filter(active=True)
            .order_by("slug")
        )

    def get_serializer_class(self):
        return (
            ProjectListSerializer
            if self.action == "list"
            else ProjectRetrieveSerializer
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
        unique_ids = list({project.id: project for project in all_projects}.keys())[:6]

        # Fetch again with annotation
        unique_projects = (
            Project.objects.filter(id__in=unique_ids)
            .annotate(
                stages_count=Count(
                    "stages", filter=Q(stages__active=True), distinct=True
                ),
                average_rating=Avg("reviews__rating"),
                ratings_count=Count("reviews", distinct=True),
                students_count=Count("enrollments", distinct=True),
                points=Sum(
                    "stages__steps__points", filter=Q(stages__steps__active=True)
                ),
                duration=Sum(
                    "stages__steps__duration", filter=Q(stages__steps__active=True)
                ),
            )
            .filter(active=True)
        )

        # Aby zachować pierwotną kolejność (bo .filter(...) nie gwarantuje jej), możesz posortować ręcznie:
        id_to_project = {project.id: project for project in unique_projects}
        sorted_projects = [
            id_to_project[pid] for pid in unique_ids if pid in id_to_project
        ]

        serializer = ProjectListSerializer(
            sorted_projects, many=True, context={"request": request}
        )
        return Response(serializer.data)


class SimilarProjectsView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        project = get_object_or_404(Project, slug=slug, active=True)

        similar_projects = (
            project.similar.all()
            .prefetch_related(
                "instructors",
                "translations",
                Prefetch(
                    "stages",
                    queryset=Stage.objects.prefetch_related("steps").order_by(
                        "projectstage__order"
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
                Prefetch(
                    "similar",
                    queryset=Project.objects.prefetch_related("translations"),
                ),
            )
            .annotate(
                stages_count=Count(
                    "stages", filter=Q(stages__active=True), distinct=True
                ),
                average_rating=Avg("reviews__rating"),
                ratings_count=Count("reviews", distinct=True),
                students_count=Count("enrollments", distinct=True),
                points=Sum(
                    "stages__steps__points", filter=Q(stages__steps__active=True)
                ),
                duration=Sum(
                    "stages__steps__duration", filter=Q(stages__steps__active=True)
                ),
            )
            .filter(active=True)
            .exclude(id=project.id)
            .distinct()[:3]
        )

        serializer = ProjectListSerializer(
            similar_projects, many=True, context={"request": request}
        )
        return Response(serializer.data)
