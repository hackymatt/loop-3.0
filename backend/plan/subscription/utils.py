from .models import PlanSubscription
from django.utils import timezone
from plan.utils import get_default_plan
from user.type.student_user.models import Student
from const import SubscriptionStatus


def get_subscription(user):
    student = Student.objects.get(user=user)
    return student.current_subscription


def subscribe(
    student,
    plan,
    start_date,
    status,
    plan_pricing=None,
    end_date=None,
    amount_due=None,
    stripe_subscription_id=None,
    cancel_at_period_end=None,
):
    subscription, _ = PlanSubscription.objects.update_or_create(
        student=student,
        defaults={
            "plan": plan,
            "plan_pricing": plan_pricing,
            "start_date": start_date,
            "end_date": end_date,
            "amount_due": amount_due,
            "status": status,
            "stripe_subscription_id": stripe_subscription_id,
            "cancel_at_period_end": cancel_at_period_end,
        },
    )
    return subscription


def subscribe_free_plan(student, start_date=timezone.now()):
    plan = get_default_plan()
    return subscribe(student, plan, start_date, SubscriptionStatus.ACTIVE)
