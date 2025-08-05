from rest_framework import viewsets
from .models import Level
from .serializers import LevelSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Count


class LevelViewSet(viewsets.ModelViewSet):
    queryset = (
        Level.objects.annotate(projects_count=Count("project"))
        .filter(projects_count__gt=0)
        .prefetch_related("translations")
        .order_by("order")
    )
    serializer_class = LevelSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "destroy"]:
            permission_classes = [
                IsAuthenticated,
                IsAdminUser,
            ]  # Admin only for Create, Update, Delete
        else:
            permission_classes = [AllowAny]  # Allow read (GET) for anyone
        return [permission() for permission in permission_classes]  # Everyone can read
