from rest_framework import viewsets
from .models import Topic
from .serializers import TopicSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.prefetch_related("translations").order_by("slug")
    serializer_class = TopicSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "destroy"]:
            permission_classes = [
                IsAuthenticated,
                IsAdminUser,
            ]  # Admin only for Create, Update, Delete
        else:
            permission_classes = [AllowAny]  # Allow read (GET) for anyone
        return [permission() for permission in permission_classes]  # Everyone can read
