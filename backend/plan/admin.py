from django.contrib import admin
from .models import Plan, PlanTranslation, PlanPricing, Option, OptionTranslation, PlanOption


def get_all_fields(model):
    return [
        field.name
        for field in model._meta.get_fields()
        if not field.many_to_many and not field.one_to_many
    ]


class PlanTranslationInline(admin.TabularInline):
    model = PlanTranslation
    extra = 1


class PlanPricingInline(admin.TabularInline):
    model = PlanPricing
    extra = 1


class PlanOptionInline(admin.TabularInline):
    model = PlanOption
    extra = 1


class OptionTranslationInline(admin.TabularInline):
    model = OptionTranslation
    extra = 1


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Plan)
    search_fields = ('type',)
    list_filter = ('popular', 'premium')
    inlines = [PlanTranslationInline, PlanPricingInline, PlanOptionInline]


@admin.register(PlanTranslation)
class PlanTranslationAdmin(admin.ModelAdmin):
    list_display = get_all_fields(PlanTranslation)
    search_fields = ('license', 'language', 'plan__type')
    list_filter = ('language',)


@admin.register(PlanPricing)
class PlanPricingAdmin(admin.ModelAdmin):
    list_display = get_all_fields(PlanPricing)
    search_fields = ('plan__type', 'currency', 'interval')
    list_filter = ('currency', 'interval')


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = get_all_fields(Option)
    search_fields = ('slug',)
    inlines = [OptionTranslationInline]


@admin.register(OptionTranslation)
class OptionTranslationAdmin(admin.ModelAdmin):
    list_display = get_all_fields(OptionTranslation)
    search_fields = ('title', 'language', 'option__slug')
    list_filter = ('language',)



@admin.register(PlanOption)
class PlanOptionAdmin(admin.ModelAdmin):
    list_display = get_all_fields(PlanOption)
    search_fields = ('plan__type', 'option__slug')
    list_filter = ('disabled',)
