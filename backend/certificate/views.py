from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Certificate
from .serializers import CertificateSerializer


class CertificateView(viewsets.ModelViewSet):
    http_method_names = ["get"]
    queryset = Certificate.objects.all().order_by("-created_at")
    serializer_class = CertificateSerializer

    def get_permissions(self):
        if self.action == "retrieve":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.action == "list":
            user = self.request.user
            return super().get_queryset().filter(student__user=user)
        return super().get_queryset()
