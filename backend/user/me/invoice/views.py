from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import InvoiceSerializer
from invoice.models import StudentInvoice


class InvoicesView(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            StudentInvoice.objects.filter(student__user=user)
            .select_related("invoice")
            .order_by("-invoice__invoice_date")
        )
