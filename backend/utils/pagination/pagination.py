from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class CustomPagination(PageNumberPagination):
    current_page = 1
    page_size = 10
    page_size_query_param = "page_size"

    def get_page_size(self, request):
        page_size = int(request.GET.get(self.page_size_query_param, self.page_size))
        if page_size == -1:
            return self.queryset.count()

        return page_size

    def paginate_queryset(self, queryset, request, view=None):
        self.queryset = queryset
        return super().paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        return Response(
            {
                "links": {
                    "next": self.get_next_link(),
                    "previous": self.get_previous_link(),
                },
                "records_count": self.page.paginator.count,
                "pages_count": self.page.paginator.num_pages,
                "page": int(self.request.GET.get("page", self.current_page)),
                "page_size": self.get_page_size(self.request),
                "results": data,
            }
        )
