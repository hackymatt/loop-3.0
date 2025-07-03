from .models import PlanSubscription
from django.utils import timezone
from django.db.models import Q
from plan.utils import get_default_plan


def get_subscription(user):
    return PlanSubscription.objects.filter(
        Q(end_date__gte=timezone.now()) | Q(end_date__isnull=True), student__user=user
    ).first()


def subscribe(student, plan, end_date):
    current_plan = get_subscription(student.user)
    current_plan.end_date = timezone.now()
    current_plan.save()
    return PlanSubscription.objects.create(
        student=student, plan=plan, end_date=end_date
    )


def subscribe_free_plan(student):
    plan = get_default_plan()
    return PlanSubscription.objects.create(student=student, plan=plan)
