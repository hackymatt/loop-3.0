from django.urls import path
from .views import PersonalDataView


from const import Urls

urlpatterns = [
    path(Urls.DATA, PersonalDataView.as_view(), name="data"),
]
