from rest_framework import viewsets
from django.db.models import Count, Q, Prefetch
from .models import Plan, PlanOption
from .serializers import PlanSerializer


class PlanViewSet(viewsets.ModelViewSet):
    http_method_names = ["get"]
    queryset = (
        Plan.objects.annotate(
            projects_count=Count("projects", filter=Q(projects__active=True))
        )
        .prefetch_related(
            "translations",
            Prefetch(
                "plan_options",
                queryset=PlanOption.objects.select_related("option")
                .prefetch_related(Prefetch("option__translations"))
                .order_by("order"),
            ),
        )
        .all()
    )
    serializer_class = PlanSerializer
    pagination_class = None
    lookup_field = "type"
