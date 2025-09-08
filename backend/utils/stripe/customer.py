import stripe
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


def create_customer(email, **kwargs):
    return stripe.Customer.create(email=email, **kwargs)


def retrieve_customer(customer_id):
    return stripe.Customer.retrieve(customer_id)


def update_customer(customer_id, **kwargs):
    return stripe.Customer.modify(customer_id, **kwargs)


def get_payment_methods(customer_id):
    return stripe.Customer.list_payment_methods(customer=customer_id)


def create_customer_session(customer_id, **kwargs):
    return stripe.CustomerSession.create(
        customer=customer_id,
        **kwargs,
    )
