from django.urls import path
from .views import DeleteAccountView


from const import Urls

urlpatterns = [
    path(Urls.DELETE_ACCOUNT, DeleteAccountView.as_view(), name="delete-account"),
]
