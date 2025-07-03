from rest_framework import routers
from rest_framework.permissions import IsAdminUser


class Router(routers.DefaultRouter):
    def __init__(self, *args, **kwargs):
        self.APIRootView._ignore_model_permissions = False
        self.APIRootView.permission_classes = [IsAdminUser]
        super().__init__(*args, **kwargs)
