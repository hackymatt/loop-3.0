from plan.subscription.utils import get_subscription
from calendar import monthrange
from user.token.models import TokenUsage
from django.db.models import Sum
from django.utils.timezone import now
import tiktoken


def get_user_tokens_left(user):
    subscription = get_subscription(user)
    plan_limit = subscription.plan.tokens_limit
    start_date = subscription.start_date.date()

    today = now().date()

    # If current month is the subscription start month, prorate the limit
    if start_date.year == today.year and start_date.month == today.month:
        total_days_in_month = monthrange(start_date.year, start_date.month)[1]
        days_remaining = total_days_in_month - start_date.day + 1
        tokens_limit = int((days_remaining / total_days_in_month) * plan_limit)
    else:
        tokens_limit = plan_limit

    first_day_of_month = today.replace(day=1)
    _, last_day = monthrange(today.year, today.month)
    last_day_of_month = today.replace(day=last_day)

    tokens_used = (
        TokenUsage.objects.filter(
            created_at__range=(first_day_of_month, last_day_of_month),
            student__user=user,
        ).aggregate(total_tokens=Sum("tokens"))["total_tokens"]
        or 0
    )

    tokens_left = tokens_limit - tokens_used
    return max(tokens_left, 0)


def is_user_within_token_limit(user):
    return get_user_tokens_left(user) > 0


def count_tokens(messages, model="gpt-3.5-turbo"):
    encoding = tiktoken.encoding_for_model(model)
    tokens_per_message = 4  # stała liczba tokenów na wiadomość w chat-completions
    tokens_per_name = -1  # jeśli wiadomość ma "name", tokeny inaczej się liczą

    total_tokens = 0
    for message in messages:
        total_tokens += tokens_per_message
        for key, value in message.items():
            total_tokens += len(encoding.encode(value))
            if key == "name":
                total_tokens += tokens_per_name
    total_tokens += 2  # końcowe tokeny systemowe

    return total_tokens
