import stripe
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


def generate_customer_portal_link(student, website_url):
    if not student.stripe_customer_id:
        return None

    session = stripe.billing_portal.Session.create(
        customer=student.stripe_customer_id,
        return_url=f"{website_url}/account/subscription",
    )

    return session.url
