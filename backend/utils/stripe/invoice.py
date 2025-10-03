import stripe
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


def preview_invoice(customer_id, **kwargs):
    return stripe.Invoice.create_preview(
        customer=customer_id,
        **kwargs,
    )
