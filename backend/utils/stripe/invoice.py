import stripe
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


def upcoming_invoice(customer_id, subscription_id):
    return stripe.Invoice.upcoming(
        customer=customer_id,
        subscription=subscription_id,
    )
