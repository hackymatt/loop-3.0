from django.contrib import admin
from .models import Step, StepTranslation, StepSubstep

admin.site.register(Step)
admin.site.register(StepTranslation)
admin.site.register(StepSubstep)
