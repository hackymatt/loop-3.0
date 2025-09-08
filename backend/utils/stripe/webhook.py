import stripe
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


def construct_event(payload, sig_header):
    return stripe.Webhook.construct_event(
        payload=payload,
        sig_header=sig_header,
        secret=CONFIG["stripe_webhook_secret"],
    )
