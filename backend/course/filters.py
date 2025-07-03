import django_filters
from django.db.models import (
    Avg,
    Count,
    IntegerField,
    FloatField,
    F,
    OuterRef,
    Subquery,
    Case,
    When,
    Value,
)
from django.db.models.functions import Coalesce, Cast
from .models import Course
from .progress.models import CourseProgress
from django_filters import rest_framework as filters
from const import UserType, CourseStatus


class CourseFilter(django_filters.FilterSet):
    levels = filters.BaseInFilter(
        field_name="level__slug", lookup_expr="in"
    )  # Filter by multiple level slugs
    categories = filters.BaseInFilter(
        field_name="category__slug", lookup_expr="in"
    )  # Filter by multiple category slugs
    technologies = filters.BaseInFilter(
        field_name="technology__slug", lookup_expr="in"
    )  # Filter by multiple technology slugs
    rating = filters.NumberFilter(
        method="filter_by_min_rating"
    )  # Filter by minimum average rating
    status = filters.CharFilter(method="filter_by_status")  # Filter by progress status

    class Meta:
        model = Course
        fields = ["level", "category", "technology", "rating"]

    def filter_by_min_rating(self, queryset, name, value):
        return queryset.annotate(avg_rating=Avg("reviews__rating")).filter(
            avg_rating__gte=value
        )

    def filter_by_status(self, queryset, name, value):
        user = self.request.user

        if not user.is_authenticated or user.user_type != UserType.STUDENT:
            return queryset

        # policz ile lekcji ma kurs
        queryset = queryset.annotate(
            total_lessons=Count("chapters__lessons", distinct=True)
        )

        # subquery, który liczy ukończone lekcje w danym kursie
        completed_lessons_subquery = (
            CourseProgress.objects.filter(
                student__user=user,
                lesson__chapterlesson__chapter__coursechapter__course=OuterRef("pk"),
                completed_at__isnull=False,
            )
            .values("lesson__chapterlesson__chapter__coursechapter__course")
            .annotate(count=Count("lesson", distinct=True))
            .values("count")[:1]
        )

        queryset = queryset.annotate(
            completed_lessons=Coalesce(
                Subquery(completed_lessons_subquery, output_field=IntegerField()), 0
            )
        )

        # oblicz progres użytkownika, bez dzielenia przez 0
        queryset = queryset.annotate(
            user_progress=Coalesce(
                Case(
                    When(total_lessons=0, then=Value(0.0)),
                    default=Cast(
                        100.0
                        * F("completed_lessons")
                        / Cast(F("total_lessons"), FloatField()),
                        FloatField(),
                    ),
                    output_field=FloatField(),
                ),
                0.0,
                output_field=FloatField(),
            )
        )

        if value == CourseStatus.NOT_STARTED:
            return queryset.filter(user_progress=0)
        elif value == CourseStatus.COMPLETED:
            return queryset.filter(user_progress=100)
        elif value == CourseStatus.IN_PROGRESS:
            return queryset.filter(user_progress__gt=0, user_progress__lt=100)

        return queryset
