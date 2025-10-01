import tiktoken

from plan.subscription.utils import get_subscription
from user.token.models import TokenUsage
from django.db.models import Sum
from django.utils import timezone
from calendar import monthrange
from const import UserType


def months_fraction_or_full(start_date, end_date):
    if start_date > end_date:
        return 0

    delta = timezone.timedelta(end_date, start_date)
    total_months = delta.years * 12 + delta.months

    if total_months == 0:
        days_in_month = monthrange(start_date.year, start_date.month)[1]
        fraction = delta.days / days_in_month
        return round(fraction, 2)
    else:
        if delta.days >= 0:
            total_months += 1
        return total_months


def get_user_tokens_left(user):
    if user.user_type != UserType.STUDENT:
        return 0

    subscription = get_subscription(user)

    plan_limit = subscription.plan.tokens_limit
    start_date = subscription.start_date.date()
    end_date = subscription.end_date.date() if subscription.end_date else start_date
    months = months_fraction_or_full(start_date, end_date)

    token_limit = plan_limit * months

    tokens_used = (
        TokenUsage.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lt=end_date,
            student__user=user,
        ).aggregate(total_tokens=Sum("tokens"))["total_tokens"]
        or 0
    )

    tokens_left = token_limit - tokens_used
    return max(tokens_left, 0)


def is_user_within_token_limit(user):
    return get_user_tokens_left(user) > 0


def count_tokens(messages, model="gpt-3.5-turbo"):
    encoding = tiktoken.encoding_for_model(model)
    tokens_per_message = 4  # stała liczba tokenów na wiadomość (nagłówki + struktura)
    total_tokens = 0

    for message in messages:
        total_tokens += tokens_per_message
        for value in message.values():
            total_tokens += len(encoding.encode(value))

    total_tokens += 2  # zakończenie rozmowy/system prompt
    return total_tokens
