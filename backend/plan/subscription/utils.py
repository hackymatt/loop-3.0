from .models import PlanSubscription
from django.utils import timezone
from django.db.models import Q
from plan.utils import get_default_plan
from plan.models import PlanPricing
from const import Currency, PaymentInterval


def get_subscription(user):
    return PlanSubscription.objects.filter(
        Q(end_date__gte=timezone.now()) | Q(end_date__isnull=True), student__user=user
    ).first()


def subscribe(student, plan_pricing, end_date=None, stripe_subscription_id=None):
    """
    End the student's current plan and create a new subscription.
    """
    current = PlanSubscription.objects.filter(
        student=student, end_date__isnull=True
    ).order_by('-start_date').first()

    if current:
        current.end_date = timezone.now()
        current.save()

    return PlanSubscription.objects.create(
        student=student,
        plan_pricing=plan_pricing,
        end_date=end_date,
        stripe_subscription_id=stripe_subscription_id,
    )

def subscribe_free_plan(student):
    plan = get_default_plan()
    default_pricing = PlanPricing.get_current_price(plan=plan, currency=Currency.PLN, interval=PaymentInterval.MONTHLY)
    return subscribe(student, default_pricing)
