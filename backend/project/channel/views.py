from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import ChannelPostSerializer, ChannelPostCreateEditSerializer, ChannelPostCommentCreateEditSerializer
from .models import ChannelPost, ChannelPostLike, ChannelPostComment
from project.models import Project
from plan.subscription.utils import get_subscription
from plan.utils import is_default_plan
from django.shortcuts import get_object_or_404
from user.type.student_user.models import Student


class ChannelPostViewSet(viewsets.ModelViewSet):
    http_method_names = ["get", "post", "delete"]
    serializer_class = ChannelPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_slug = self.kwargs["slug"]
        project = get_object_or_404(Project, slug=project_slug, active=True)
        return ChannelPost.objects.filter(project=project).order_by("-created_at")
    
    def list(self, request, *args, **kwargs):
        student = Student.objects.get(user=request.user)

        # Plan check: limit access for free users
        if is_default_plan(get_subscription(student.user).plan):
            return Response({}, status=status.HTTP_403_FORBIDDEN)

        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        student = Student.objects.get(user=request.user)

        # Plan check: limit access for free users
        if is_default_plan(get_subscription(student.user).plan):
            return Response(
                {},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project_slug = self.kwargs["slug"]
        project = get_object_or_404(Project, slug=project_slug, active=True)
        language = request.LANGUAGE_CODE

        serializer = ChannelPostCreateEditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student=student, project=project, language=language)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        student = Student.objects.get(user=request.user)
        project_slug = self.kwargs["slug"]
        project = get_object_or_404(Project, slug=project_slug, active=True)

        post_id = self.kwargs.get("post_id") 
        post = get_object_or_404(ChannelPost, pk=post_id, project=project, student=student)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ChannelPostCommentViewSet(viewsets.ModelViewSet):
    http_method_names = ["post", "delete"]
    permission_classes = [IsAuthenticated]

   
    def create(self, request, *args, **kwargs):
        student = Student.objects.get(user=request.user)

        # Plan check: limit access for free users
        if is_default_plan(get_subscription(student.user).plan):
            return Response(
                {},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project_slug = self.kwargs["slug"]
        project = get_object_or_404(Project, slug=project_slug, active=True)

        post_id = request.data.get("post_id")
        post = get_object_or_404(ChannelPost, pk=post_id, project=project)

        serializer = ChannelPostCommentCreateEditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student=student, channel_post=post)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, *args, **kwargs):
        student = Student.objects.get(user=request.user)
        project_slug = self.kwargs["slug"]
        project = get_object_or_404(Project, slug=project_slug, active=True)

        post_id = self.kwargs.get("post_id")
        post = get_object_or_404(ChannelPost, pk=post_id, project=project)

        comment_id = self.kwargs.get("comment_id") 
        post_comment = get_object_or_404(ChannelPostComment, pk=comment_id, channel_post=post, student=student)
        post_comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChannelPostLikeViewSet(viewsets.ModelViewSet):
    http_method_names = ["post"]
    permission_classes = [IsAuthenticated]

   
    def create(self, request, *args, **kwargs):
        student = Student.objects.get(user=request.user)

        # Plan check: limit access for free users
        if is_default_plan(get_subscription(student.user).plan):
            return Response(
                {},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project_slug = self.kwargs["slug"]
        project = get_object_or_404(Project, slug=project_slug, active=True)

        post_id = request.data.get("post_id")
        post = get_object_or_404(ChannelPost.objects.exclude(student=student), pk=post_id, project=project)

        like = ChannelPostLike.objects.filter(student=student, channel_post=post).first()
        if like: 
            like.delete()
        else:
            ChannelPostLike.objects.create(student=student, channel_post=post)

        return Response(status=status.HTTP_200_OK)
