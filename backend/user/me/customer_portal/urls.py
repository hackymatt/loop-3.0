from django.urls import path
from .views import CustomerPortalLinkView


from const import Urls

urlpatterns = [
    path(
        Urls.CUSTOMER_PORTAL_LINK,
        CustomerPortalLinkView.as_view(),
        name="customer-portal-link",
    ),
]
