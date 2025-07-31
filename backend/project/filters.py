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
from .models import Project
from .progress.models import ProjectProgress
from django_filters import rest_framework as filters
from const import UserType, ProjectStatus, ProjectDuration


class ProjectFilter(django_filters.FilterSet):
    levels = filters.BaseInFilter(
        field_name="level__slug", lookup_expr="in"
    )  # Filter by multiple level slugs
    categories = filters.BaseInFilter(
        field_name="category__slug", lookup_expr="in"
    )  # Filter by multiple category slugs
    technologies = filters.BaseInFilter(
        field_name="technology__slug", lookup_expr="in"
    )  # Filter by multiple technology slugs
    duration = filters.CharFilter(method="filter_by_duration")  # Filter by duration
    rating = filters.NumberFilter(
        method="filter_by_min_rating"
    )  # Filter by minimum average rating
    status = filters.CharFilter(method="filter_by_status")  # Filter by progress status

    class Meta:
        model = Project
        fields = ["level", "category", "technology", "rating"]

    def filter_by_min_rating(self, queryset, name, value):
        return queryset.annotate(avg_rating=Avg("reviews__rating")).filter(
            avg_rating__gte=value
        )

    def filter_by_duration(self, queryset, name, value):
        if value == ProjectDuration.SHORT:
            return queryset.filter(duration__lt=120)
        elif value == ProjectDuration.MEDIUM:
            return queryset.filter(duration__gte=120, duration__lt=300)
        else:
            return queryset.filter(duration__gte=300)

    def filter_by_status(self, queryset, name, value):
        user = self.request.user

        if not user.is_authenticated or user.user_type != UserType.STUDENT:
            return queryset

        # policz ile kroków ma projekt
        queryset = queryset.annotate(total_steps=Count("stages__steps", distinct=True))

        # subquery, który liczy ukończone kroki w danym projekcie
        completed_steps_subquery = (
            ProjectProgress.objects.filter(
                student__user=user,
                step__stagestep__stage__projectstage__project=OuterRef("pk"),
                completed_at__isnull=False,
            )
            .values("step__stagestep__stage__projectstage__project")
            .annotate(count=Count("step", distinct=True))
            .values("count")[:1]
        )

        queryset = queryset.annotate(
            completed_steps=Coalesce(
                Subquery(completed_steps_subquery, output_field=IntegerField()), 0
            )
        )

        # oblicz progres użytkownika, bez dzielenia przez 0
        queryset = queryset.annotate(
            user_progress=Coalesce(
                Case(
                    When(total_steps=0, then=Value(0.0)),
                    default=Cast(
                        100.0
                        * F("completed_steps")
                        / Cast(F("total_steps"), FloatField()),
                        FloatField(),
                    ),
                    output_field=FloatField(),
                ),
                0.0,
                output_field=FloatField(),
            )
        )

        if value == ProjectStatus.NOT_STARTED:
            return queryset.filter(user_progress=0)
        elif value == ProjectStatus.COMPLETED:
            return queryset.filter(user_progress=100)
        elif value == ProjectStatus.IN_PROGRESS:
            return queryset.filter(user_progress__gt=0, user_progress__lt=100)

        return queryset
