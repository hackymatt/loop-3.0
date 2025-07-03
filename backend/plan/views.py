from rest_framework import viewsets
from django.db.models import Prefetch
from .models import Plan, PlanOption
from .serializers import PlanSerializer


class PlanViewSet(viewsets.ModelViewSet):
    http_method_names = ["get"]
    queryset = Plan.objects.prefetch_related(
        "translations",
        Prefetch(
            "plan_options",
            queryset=PlanOption.objects.select_related("option").prefetch_related(
                Prefetch("option__translations")
            ),
        ),
    ).all()
    serializer_class = PlanSerializer
    pagination_class = None
    lookup_field = "slug"
