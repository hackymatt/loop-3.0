from django.contrib import admin
from .models import Plan, PlanTranslation, Option, OptionTranslation, PlanOption

admin.site.register(Plan)
admin.site.register(PlanTranslation)
admin.site.register(Option)
admin.site.register(OptionTranslation)
admin.site.register(PlanOption)
