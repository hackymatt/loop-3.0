from rest_framework import serializers
from .models import ChannelPost, ChannelPostComment, ChannelPostImage
from user.type.student_user.serializers import StudentSerializer
from global_config import CONFIG


class ChannelPostCommentSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = ChannelPostComment
        fields = [
            "id",
            "student",
            "message",
            "created_at",
            "is_mine",
        ]

    def get_is_mine(self, obj):
        request = self.context.get("request")
        return obj.student.user == request.user


class ChannelPostSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    helpful_count = serializers.IntegerField(source="likes.count", read_only=True)
    is_helpful = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()

    class Meta:
        model = ChannelPost
        fields = [
            "id",
            "title",
            "student",
            "message",
            "helpful_count",
            "is_helpful",
            "is_mine",
            "created_at",
            "comments",
        ]

    def get_is_helpful(self, obj):
        request = self.context.get("request")
        return obj.likes.filter(student__user=request.user).exists()

    def get_is_mine(self, obj):
        request = self.context.get("request")
        return obj.student.user == request.user

    def get_comments(self, obj):
        return ChannelPostCommentSerializer(
            obj.comments.all(), many=True, context=self.context
        ).data


class ChannelPostCreateEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChannelPost
        fields = ["title", "message"]


class ChannelPostCommentCreateEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChannelPostComment
        fields = ["message"]


class ChannelPostImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ChannelPostImage
        fields = ["image", "url"]

    def get_url(self, obj):
        request = self.context.get("request")
        return (
            f"http://localhost:8000{obj.image.url}"
            if CONFIG["is_local"]
            else request.build_absolute_uri(obj.image.url)
            if obj.image and hasattr(obj.image, "url") and request
            else None
        )
