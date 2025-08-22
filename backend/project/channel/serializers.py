from rest_framework import serializers
from .models import ChannelPost, ChannelPostComment, ChannelPostLike
from user.type.student_user.serializers import StudentSerializer


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
