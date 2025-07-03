from rest_framework.mixins import RetrieveModelMixin
from rest_framework import status, views
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Lesson, ReadingLesson, VideoLesson, QuizLesson, CodingLesson
from .serializers import (
    ReadingLessonBaseSerializer,
    ReadingLessonSerializer,
    VideoLessonBaseSerializer,
    VideoLessonSerializer,
    QuizLessonBaseSerializer,
    QuizLessonSerializer,
    CodingLessonBaseSerializer,
    CodingLessonSerializer,
    QuizLessonSubmitSerializer,
    CodingLessonSubmitSerializer,
)
from ..enrollment.models import CourseEnrollment, CourseChapterEnrollment
from ..progress.models import CourseProgress
from ..models import Course
from ..chapter.models import Chapter
from plan.subscription.utils import get_subscription
from plan.utils import is_default_plan
from user.type.student_user.models import Student
from const import LessonType


def get_answer(lesson, language):
    specific_model = {
        LessonType.QUIZ: QuizLesson,
        LessonType.CODING: CodingLesson,
    }.get(lesson.type)

    if lesson.type == LessonType.QUIZ:
        question = (
            specific_model.objects.get(lesson=lesson).get_translation(language).question
        )
        answer = [option.is_correct for option in question.options.all()]
    elif lesson.type == LessonType.CODING:
        answer = specific_model.objects.get(lesson=lesson).file.solution
    else:
        answer = None

    return answer


class LessonViewSet(RetrieveModelMixin, GenericViewSet):
    queryset = Lesson.objects.select_related("reading", "video", "quiz", "coding")
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        course_slug = kwargs.get("course_slug")
        chapter_slug = kwargs.get("chapter_slug")
        lesson_slug = kwargs.get("lesson_slug")

        student = Student.objects.get(user=request.user)
        course = get_object_or_404(Course, slug=course_slug, active=True)
        chapter = get_object_or_404(Chapter, slug=chapter_slug, active=True)
        lesson = get_object_or_404(Lesson, slug=lesson_slug, active=True)

        if not course.chapters.filter(id=chapter.id).exists():
            return Response(
                {"root": "Chapter not in this course."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not chapter.lessons.filter(id=lesson.id).exists():
            return Response(
                {"root": "Lesson not found in this course chapter."},
                status=status.HTTP_404_NOT_FOUND,
            )

        CourseEnrollment.objects.get_or_create(student=student, course=course)

        lesson_model_map = {
            LessonType.READING: ReadingLesson,
            LessonType.VIDEO: VideoLesson,
            LessonType.QUIZ: QuizLesson,
            LessonType.CODING: CodingLesson,
        }

        serializer_map = {
            LessonType.READING: ReadingLessonSerializer,
            LessonType.VIDEO: VideoLessonSerializer,
            LessonType.QUIZ: QuizLessonSerializer,
            LessonType.CODING: CodingLessonSerializer,
        }

        base_serializer_map = {
            LessonType.READING: ReadingLessonBaseSerializer,
            LessonType.VIDEO: VideoLessonBaseSerializer,
            LessonType.QUIZ: QuizLessonBaseSerializer,
            LessonType.CODING: CodingLessonBaseSerializer,
        }

        specific_model = lesson_model_map.get(lesson.type)
        specific_lesson = specific_model.objects.get(lesson=lesson)

        # Plan check: limit access for free users
        if is_default_plan(get_subscription(student.user).plan):
            if (
                CourseChapterEnrollment.objects.filter(student=student, course=course)
                .exclude(chapter=chapter)
                .exists()
            ):
                base_serializer_class = base_serializer_map.get(lesson.type)
                serializer = base_serializer_class(
                    specific_lesson, context={"request": request}
                )
                return Response(serializer.data, status=status.HTTP_403_FORBIDDEN)

        # Allow full access
        CourseChapterEnrollment.objects.get_or_create(
            student=student, course=course, chapter=chapter
        )
        answer = get_answer(lesson, request.LANGUAGE_CODE)
        CourseProgress.objects.get_or_create(
            student=student,
            lesson=lesson,
            defaults={"points": lesson.points, "answer": answer},
        )

        serializer_class = serializer_map.get(lesson.type)
        serializer = serializer_class(specific_lesson, context={"request": request})
        return Response(serializer.data)


class LessonProgressAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        lesson_slug = request.data.pop("lesson")
        lesson = get_object_or_404(Lesson, slug=lesson_slug, active=True)

        answer = request.data.get("answer")

        # Save progress
        student = Student.objects.get(user=request.user)
        CourseProgress.objects.update_or_create(
            student=student,
            lesson=lesson,
            defaults={"answer": answer},
        )

        return Response({}, status=status.HTTP_200_OK)


class LessonSubmitAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        lesson_slug = request.data.pop("lesson")
        lesson = get_object_or_404(Lesson, slug=lesson_slug, active=True)

        specific_model = {
            LessonType.QUIZ: QuizLesson,
            LessonType.CODING: CodingLesson,
        }.get(lesson.type)

        serializer_class = {
            LessonType.QUIZ: QuizLessonSubmitSerializer,
            LessonType.CODING: CodingLessonSubmitSerializer,
        }.get(lesson.type)

        answer = None
        if serializer_class:
            specific_lesson = specific_model.objects.get(lesson=lesson)
            serializer = serializer_class(
                data=request.data,
                context={"lesson": specific_lesson, "request": request},
            )
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            answer = serializer.validated_data["answer"]

        # Save progress
        student = Student.objects.get(user=request.user)
        CourseProgress.objects.update_or_create(
            student=student,
            lesson=lesson,
            defaults={"answer": answer, "completed_at": timezone.now()},
        )

        return Response({}, status=status.HTTP_200_OK)


class LessonAnswerAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        lesson_slug = request.data.pop("lesson")
        lesson = get_object_or_404(Lesson, slug=lesson_slug, active=True)

        answer = get_answer(lesson, request.LANGUAGE_CODE)

        student = Student.objects.get(user=request.user)
        CourseProgress.objects.update_or_create(
            student=student,
            lesson=lesson,
            defaults={"answer": answer, "completed_at": timezone.now(), "points": 0},
        )

        return Response({"answer": answer}, status=status.HTTP_200_OK)


class LessonHintAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        lesson_slug = request.data.pop("lesson")
        lesson = get_object_or_404(Lesson, slug=lesson_slug, active=True)

        specific_model = {
            LessonType.CODING: CodingLesson,
        }.get(lesson.type)

        if lesson.type == LessonType.CODING:
            specific_lesson = specific_model.objects.get(lesson=lesson)
            hint = specific_lesson.get_translation(request.LANGUAGE_CODE).hint
            penalty_points = specific_lesson.penalty_points
        else:
            hint = None
            penalty_points = 0

        student = Student.objects.get(user=request.user)
        CourseProgress.objects.update_or_create(
            student=student,
            lesson=lesson,
            defaults={"hint_used": True, "points": lesson.points - penalty_points},
        )

        return Response({"hint": hint}, status=status.HTTP_200_OK)
