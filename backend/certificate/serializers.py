from rest_framework import serializers
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    course_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    completed_at = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Certificate
        fields = ["id", "course_name", "student_name", "completed_at"]

    def get_course_name(self, obj):
        lang = self.context.get("request").LANGUAGE_CODE
        return obj.course.get_translation(lang).name

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"
