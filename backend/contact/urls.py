from django.urls import path

from .views import ContactView


from const import Urls

# Define all your API URL patterns
urlpatterns = [
    path(Urls.CONTACT, ContactView.as_view(), name="contact"),
]
