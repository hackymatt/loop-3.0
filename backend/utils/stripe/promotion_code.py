import stripe
from global_config import CONFIG

stripe.api_key = CONFIG["stripe_secret_key"]


def retrieve_promotion_code(promotion_code_id):
    return stripe.PromotionCode.retrieve(promotion_code_id)
