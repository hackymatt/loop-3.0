from .views import PlanViewSet
from .payment.urls import urlpatterns as payment_urls
from core.routers import Router
from django.urls import path, include
from const import Urls

router = Router(trailing_slash=False)
router.register(Urls.PLAN, PlanViewSet, basename="plans")

urlpatterns = [
    path("", include(payment_urls)),
    path("", include(router.urls)),
]
