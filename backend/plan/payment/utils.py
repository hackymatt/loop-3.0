from rest_framework.response import Response
from rest_framework import status
from django.utils.translation import gettext as _
from user.type.student_user.models import Student
from plan.models import Plan
from .models import PaymentDiscount
from utils.stripe.promotion_code import retrieve_promotion_code


def is_coupon_valid(user, code, type, currency):
    plan = Plan.objects.get(type=type)

    student = Student.objects.get(user=user)

    discount = PaymentDiscount.objects.filter(code=code).first()
    if not discount:
        return False, _("Invalid promotion code")
    if not discount.active:
        return False, _("Coupon is inactive")
    if discount.is_expired():
        return False, _("Coupon has expired")
    if discount.currency and discount.currency != currency:
        return False, _("Coupon is not valid for this currency")
    if (
        discount.max_redemptions
        and retrieve_promotion_code(discount.stripe_promotion_code_id).times_redeemed
        >= discount.max_redemptions
    ):
        return False, _("Coupon has already been used")
    restrictions = discount.restrictions or {}
    allowed_products = restrictions.get("applies_to", {}).get("products", [])
    if allowed_products and plan.stripe_product_id not in allowed_products:
        return False, _("Coupon does not apply to this product")
    if restrictions.get("first_time_transaction") and not student.first_purchase:
        return False, _("Coupon is only for first-time purchase")
    allowed_customer = restrictions.get("customer")
    if allowed_customer and student.stripe_customer_id != allowed_customer:
        return False, _("Coupon cannot be used by this customer")
    return True, {
        "value": discount.percent_off if discount.percent_off else discount.amount_off,
        "is_percentage": discount.percent_off is not None,
    }
