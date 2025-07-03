from rest_framework import viewsets
from .models import Level
from .serializers import LevelSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny


class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.prefetch_related("translations").order_by("order")
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
