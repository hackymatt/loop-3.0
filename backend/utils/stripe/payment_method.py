import stripe
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


def retrieve_payment_method(payment_method_id):
    return stripe.PaymentMethod.retrieve(payment_method_id)


def modify_payment_method(payment_method_id, **kwargs):
    return stripe.PaymentMethod.modify(payment_method_id, **kwargs)


def detach_payment_method(payment_method_id):
    return stripe.PaymentMethod.detach(payment_method_id)
