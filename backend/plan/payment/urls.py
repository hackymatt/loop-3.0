from django.urls import path
from .views import CreateSubscriptionView
from const import Urls

urlpatterns = [
    path(
        Urls.CREATE_SUBSCRIPTION,
        CreateSubscriptionView.as_view(),
        name="create-subscription",
    ),
]
