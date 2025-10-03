from django.urls import path
from .views import ActivateAccountView, ResendActivationLinkView


from const import Urls

urlpatterns = [
    path(Urls.ACTIVATE, ActivateAccountView.as_view(), name="activate"),
    path(Urls.RESEND, ResendActivationLinkView.as_view(), name="resend"),
]
