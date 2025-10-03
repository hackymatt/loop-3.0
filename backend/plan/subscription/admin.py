from django.contrib import admin
from .models import PlanSubscription


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


@admin.register(PlanSubscription)
class PlanSubscriptionAdmin(admin.ModelAdmin):
    list_display = get_all_fields(PlanSubscription)
    search_fields = (
        "student__user__email",
        "plan_pricing__plan__type",
        "plan_pricing__interval",
    )
    list_filter = (
        "plan_pricing__plan",
        "plan_pricing__currency",
        "plan_pricing__interval",
    )
