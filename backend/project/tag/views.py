from rest_framework import viewsets
from .models import Tag
from .serializers import TagSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.prefetch_related("translations").order_by("slug")
    serializer_class = TagSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "destroy"]:
            permission_classes = [
                IsAuthenticated,
                IsAdminUser,
            ]  # Admin only for Create, Update, Delete
        else:
            permission_classes = [AllowAny]  # Allow read (GET) for anyone
        return [permission() for permission in permission_classes]  # Everyone can read
