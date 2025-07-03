from rest_framework import serializers
from .models import Review
from user.type.student_user.serializers import StudentSerializer


class ReviewSummarySerializer(serializers.Serializer):
    rating = serializers.IntegerField()
    count = serializers.IntegerField()


class ReviewSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ["student", "rating", "comment", "created_at"]


class ReviewSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["rating", "comment", "language"]
