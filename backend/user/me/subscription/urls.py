from django.urls import path
from .views import SubscriptionView


from const import Urls

urlpatterns = [
    path(Urls.SUBSCRIPTION, SubscriptionView.as_view(), name="subscription"),
]
