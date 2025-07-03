from .models import Blog
from django_filters import rest_framework as filters


class BlogFilter(filters.FilterSet):
    category = filters.CharFilter(field_name="topic__slug", lookup_expr="exact")
    tags = filters.BaseInFilter(field_name="tags__slug", lookup_expr="in")

    class Meta:
        model = Blog
        fields = ["category", "tags"]
