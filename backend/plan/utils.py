from .models import Plan
from global_config import CONFIG


def get_default_plan():
    type = CONFIG["default_plan"]
    return Plan.objects.get(type=type)
