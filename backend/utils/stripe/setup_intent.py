import stripe
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


def retrieve_setup_intent(setup_intent_id, **kwargs):
    return stripe.SetupIntent.retrieve(setup_intent_id, **kwargs)

def create_setup_intent(customer_id, **kwargs):
    return stripe.SetupIntent.create(customer=customer_id, **kwargs)
