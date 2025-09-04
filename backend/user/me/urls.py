from django.urls import path, include
from .personal.urls import urlpatterns as personal_urls
from .password.urls import urlpatterns as password_urls
from .account.urls import urlpatterns as account_urls
from .payment.urls import urlpatterns as payment_urls
from .invoice.urls import urlpatterns as invoice_urls
from .subscription.urls import urlpatterns as subscription_urls
from .customer_portal.urls import urlpatterns as customer_portal_urls
from .dashboard.urls import urlpatterns as dashboard_urls

urlpatterns = [
    path("", include(dashboard_urls)),
    path("", include(personal_urls)),
    path("", include(password_urls)),
    path("", include(account_urls)),
    path("", include(payment_urls)),
    path("", include(invoice_urls)),
    path("", include(subscription_urls)),
    path("", include(customer_portal_urls)),
]
