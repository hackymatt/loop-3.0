import stripe
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


def create_customer(email, **kwargs):
    return stripe.Customer.create(email=email, **kwargs)


def retrieve_customer(stripe_id):
    return stripe.Customer.retrieve(stripe_id)


def update_customer(stripe_id, **kwargs):
    return stripe.Customer.modify(stripe_id, **kwargs)


def get_payment_methods(stripe_id):
    return stripe.Customer.list_payment_methods(customer=stripe_id)


def create_customer_session(stripe_id, **kwargs):
    return stripe.CustomerSession.create(
                customer=stripe_id,
                **kwargs,
            )