from .views import CertificateView
from core.routers import Router
from django.urls import path, include
from const import Urls

router = Router(trailing_slash=False)
router.register(Urls.CERTIFICATE, CertificateView, basename="certificate")

urlpatterns = [
    path("", include(router.urls)),
]
