from django.urls import path
from .views import PasswordResetView, PasswordResetConfirmView


from const import Urls

urlpatterns = [
    path(Urls.PASSWORD_RESET, PasswordResetView.as_view(), name="password_reset"),
    path(
        Urls.PASSWORD_RESET_CONFIRM,
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
]
