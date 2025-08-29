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
    stripe_subscription_id=None,
    auto_renew=None,
):
    return PlanSubscription.objects.create(
        student=student,
        plan=plan,
        plan_pricing=plan_pricing,
        start_date=start_date,
        end_date=end_date,
        status=status,
        stripe_subscription_id=stripe_subscription_id,
        auto_renew=auto_renew,
    )


def subscribe_free_plan(student, start_date=timezone.now()):
    plan = get_default_plan()
    return subscribe(student, plan, start_date, SubscriptionStatus.ACTIVE)


def unsubscribe_free_plan(student):
    subscription = student.current_subscription
    if subscription.plan.is_default_plan:
        subscription.end_date = timezone.now()
        subscription.save()
