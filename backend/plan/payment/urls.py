from django.urls import path
from .views import (
    CreateSetupIntentView,
    CreateSubscriptionView,
    ValidateCouponView,
    PreviewInvoiceView,
    StripeWebhookView,
)
from const import Urls

urlpatterns = [
    path(
        Urls.CREATE_SETUP_INTENT,
        CreateSetupIntentView.as_view(),
        name="create-setup-intent",
    ),
    path(
        Urls.CREATE_SUBSCRIPTION,
        CreateSubscriptionView.as_view(),
        name="create-subscription",
    ),
    path(Urls.VALIDATE_COUPON, ValidateCouponView.as_view(), name="validate_coupon"),
    path(Urls.PREVIEW_INVOICE, PreviewInvoiceView.as_view(), name="preview_invoice"),
    path(
        Urls.STRIPE_WEBHOOK,
        StripeWebhookView.as_view(),
        name="stripe-webhook",
    ),
]
