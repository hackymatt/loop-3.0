from django.urls import path
from .views import PaymentMethodsView


from const import Urls

urlpatterns = [
    path(
        Urls.PAYMENT_METHODS,
        PaymentMethodsView.as_view(),
        name="payment-methods",
    ),
    path(
        f"{Urls.PAYMENT_METHODS}/<str:payment_method_id>",
        PaymentMethodsView.as_view(),
        name="payment-method-detail",
    ),
]
