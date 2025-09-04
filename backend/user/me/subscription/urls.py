from django.urls import path
from .views import SubscriptionView, CancelSubscriptionView, RenewSubscriptionView, ChangeSubscriptionView


from const import Urls

urlpatterns = [
    path(Urls.SUBSCRIPTION, SubscriptionView.as_view(), name="subscription"),
    path(Urls.CANCEL_SUBSCRIPTION, CancelSubscriptionView.as_view(), name="cancel-subscription"), 
    path(Urls.RENEW_SUBSCRIPTION, RenewSubscriptionView.as_view(), name="renew-subscription"), 
    path(Urls.CHANGE_SUBSCRIPTION, ChangeSubscriptionView.as_view(), name="change-subscription"), 
]
