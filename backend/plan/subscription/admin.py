from django.contrib import admin
from .models import PlanSubscription


@admin.register(PlanSubscription)
class PlanSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("student", "plan", "start_date", "end_date")
    readonly_fields = ("start_date",)
    ordering = ("-start_date",)
