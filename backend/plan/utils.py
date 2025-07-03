from .models import Plan
from global_config import CONFIG


def get_default_plan():
    slug = CONFIG["default_plan"]
    return Plan.objects.get(slug=slug)


def is_default_plan(plan):
    default_plan = get_default_plan()
    return plan.id == default_plan.id
