from django.db.models.signals import post_save
from django.dispatch import receiver
from certificate.models import Certificate
from ..models import Course
from .models import CourseProgress
from ..lesson.models import Lesson


@receiver(post_save, sender=CourseProgress)
def create_certificate_on_course_completion(sender, instance, **kwargs):
    student = instance.student
    lesson = instance.lesson

    if instance.completed_at is None:
        return

    # Find all courses that contain this lesson through chapters
    courses = Course.objects.filter(chapters__lessons=lesson).distinct()

    for course in courses:
        already_certified = Certificate.objects.filter(
            student=student, course=course
        ).exists()
        if already_certified:
            continue

        # All lessons in the course (via chapters)
        course_lessons = Lesson.objects.filter(
            chapterlesson__chapter__in=course.chapters.all(), active=True
        ).count()

        # Lessons completed by the student for this course
        completed_lessons = Lesson.objects.filter(
            chapterlesson__chapter__in=course.chapters.all(),
            courseprogress__student=student,
        ).count()

        if course_lessons != completed_lessons:
            continue

        Certificate.objects.create(student=student, course=course)
