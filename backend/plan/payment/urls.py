from django.urls import path
from .views import create_payment_intent
from const import Urls

urlpatterns = [
    path(Urls.PAYMENT_INTENT, create_payment_intent),
]
