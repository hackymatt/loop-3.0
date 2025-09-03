from core.routers import Router
from django.urls import path, include

from const import Urls
from .views import InvoicesView

router = Router(trailing_slash=False)
router.register(Urls.INVOICES, InvoicesView, basename="invoices")

# Define all your API URL patterns
urlpatterns = [
    path("", include(router.urls)),
]
