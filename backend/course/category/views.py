from rest_framework import viewsets
from .models import Category
from .serializers import CategorySerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.prefetch_related("translations").order_by("slug")
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ["create", "update", "destroy"]:
            permission_classes = [
                IsAuthenticated,
                IsAdminUser,
            ]  # Admin only for Create, Update, Delete
        else:
            permission_classes = [AllowAny]  # Allow read (GET) for anyone
        return [permission() for permission in permission_classes]  # Everyone can read
