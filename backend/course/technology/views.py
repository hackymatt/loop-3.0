from rest_framework import viewsets, views
from rest_framework.response import Response
from .models import Technology
from .serializers import TechnologySerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Count, Avg, Q


class TechnologyViewSet(viewsets.ModelViewSet):
    queryset = Technology.objects.order_by("name")
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
                course_count=Count(
                    "course", filter=Q(course__active=True), distinct=True
                ),
                avg_rating=Avg("course__reviews__rating"),
                total_enrollments=Count("course__enrollments", distinct=True),
            )
            .filter(course_count__gt=0)  # only those with active courses
            .order_by("-total_enrollments", "-avg_rating")[:9]
        )

        serializer = TechnologySerializer(
            technologies, many=True, context={"request": request}
        )
        return Response(serializer.data)
