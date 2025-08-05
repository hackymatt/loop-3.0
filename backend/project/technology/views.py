from rest_framework import viewsets, views
from rest_framework.response import Response
from .models import Technology
from .serializers import TechnologySerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Count, Avg, Q


class TechnologyViewSet(viewsets.ModelViewSet):
    queryset = (
        Technology.objects.annotate(projects_count=Count("projects"))
        .filter(projects_count__gt=0)
        .order_by("name")
    )
    serializer_class = TechnologySerializer

    def get_permissions(self):
        if self.action in ["create", "update", "destroy"]:
            permission_classes = [
                IsAuthenticated,
                IsAdminUser,
            ]  # Admin only for Create, Update, Delete
        else:
            permission_classes = [AllowAny]  # Allow read (GET) for anyone
        return [permission() for permission in permission_classes]  # Everyone can read


class FeaturedTechnologiesView(views.APIView):
    def get(self, request):
        # Aggregate stats per technology
        technologies = (
            Technology.objects.annotate(
                project_count=Count(
                    "projects", filter=Q(projects__active=True), distinct=True
                ),
                avg_rating=Avg("projects__reviews__rating"),
                total_enrollments=Count("projects__enrollments", distinct=True),
            )
            .filter(project_count__gt=0)  # only those with active projects
            .order_by("-total_enrollments", "-avg_rating")[:9]
        )

        serializer = TechnologySerializer(
            technologies, many=True, context={"request": request}
        )
        return Response(serializer.data)
