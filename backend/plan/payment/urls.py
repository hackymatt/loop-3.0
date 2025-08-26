from django.urls import path
from .views import CreateSetupIntentView, StripeWebhookView
from const import Urls

urlpatterns = [
    path(
        Urls.CREATE_SETUP_INTENT,
        CreateSetupIntentView.as_view(),
        name="create-setup-intent",
    ),
    path(
        Urls.STRIPE_WEBHOOK,
        StripeWebhookView.as_view(),
        name="stripe-webhook",
    ),
]
