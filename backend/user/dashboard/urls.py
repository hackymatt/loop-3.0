from django.urls import path
from .views import DashboardView


from const import Urls

urlpatterns = [
    path(Urls.DASHBOARD, DashboardView.as_view(), name="dashboard"),
]
