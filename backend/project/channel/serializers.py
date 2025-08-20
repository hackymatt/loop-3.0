from rest_framework import serializers
from .models import ChannelPost, ChannelPostComment
from user.type.student_user.serializers import StudentSerializer


class ChannelPostCommentSerializer(serializers.ModelSerializer):
    student = StudentSerializer()

    class Meta:
        model = ChannelPostComment
        fields = (
            "id",
            "student",
            "message",
            "created_at",
        )


class ChannelPostSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    helpful_count = serializers.IntegerField(source="likes.count", read_only=True)
    is_helpful = serializers.SerializerMethodField()
    comments = ChannelPostCommentSerializer(many=True, read_only=True)

    class Meta:
        model = ChannelPost
        fields = (
            "id",
            "title",
            "student",
            "message",
            "helpful_count",
            "is_helpful",
            "created_at",
            "comments",
        )

    def get_is_helpful(self, obj):
        request = self.context.get("request")
        return obj.likes.filter(student__user=request.user).exists()


class ChannelPostSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChannelPost
        fields = ["title", "message", "language"]
