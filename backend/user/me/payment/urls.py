from django.urls import path, include
from core.routers import Router
from .views import PaymentMethodViewSet
from const import Urls

router = Router(trailing_slash=False)
router.register(Urls.PAYMENT_METHODS, PaymentMethodViewSet, basename="payment-methods")

urlpatterns = [
    path("", include(router.urls)),
]
