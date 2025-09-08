import stripe
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


def retrieve_subscription(subscription_id):
    return stripe.Subscription.retrieve(subscription_id)


def create_subscription(customer_id, **kwargs):
    return stripe.Subscription.create(customer=customer_id, **kwargs)


def modify_subscription(subscription_id, **kwargs):
    return stripe.Subscription.modify(subscription_id, **kwargs)
