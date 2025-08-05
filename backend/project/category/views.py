from rest_framework import viewsets
from .models import Category
from .serializers import CategorySerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Count, Q


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

    def get_queryset(self):
        if self.request.method == "GET":
            return self.queryset.annotate(
                project_count=Count(
                    "project", filter=Q(project__active=True), distinct=True
                )
            ).filter(project_count__gt=0)
        return self.queryset
