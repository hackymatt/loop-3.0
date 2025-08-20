from rest_framework import viewsets, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import ChannelPostSerializer, ChannelPostSubmitSerializer
from .models import ChannelPost
from project.models import Project
from django.shortcuts import get_object_or_404
from user.type.student_user.models import Student


class ChannelViewSet(viewsets.ModelViewSet):
    http_method_names = ["get"]  # Only allow GET requests
    serializer_class = ChannelPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_slug = self.kwargs["slug"]
        project = get_object_or_404(Project, slug=project_slug, active=True)
        return ChannelPost.objects.filter(project=project).order_by("-created_at")


class SubmitChannelPostView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = get_object_or_404(Student, user=request.user)
        slug = request.data.get("slug")
        project = get_object_or_404(Project, slug=slug, active=True)

        title = request.data.get("title")
        message = request.data.get("message")
        language = request.LANGUAGE_CODE

        serializer = ChannelPostSubmitSerializer(
            data={"title": title, "message": message, "language": language}
        )
        serializer.is_valid(raise_exception=True)

        post, created = ChannelPost.objects.create(
            student=student,
            project=project,
            title=title,
            message=message,
            language=language,
        )

        return Response(
            ChannelPostSerializer(post).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
