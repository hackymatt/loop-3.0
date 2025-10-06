from plan.subscription.utils import get_subscription
from project.consultation.models import Consultation
from dateutil.relativedelta import relativedelta
from calendar import monthrange
from const import UserType
from mailer.mailer import Mailer
from utils.url.url import get_website_url
from django.utils.translation import gettext as _
from django.utils import translation
from global_config import CONFIG


def months_fraction_or_full(start_date, end_date):
    if start_date > end_date:
        return 0

    delta = relativedelta(end_date, start_date)
    total_months = delta.years * 12 + delta.months

    if total_months == 0:
        days_in_month = monthrange(start_date.year, start_date.month)[1]
        fraction = delta.days / days_in_month
        return round(fraction, 2)

    return total_months + 1


def get_user_consultations_left(user):
    if user.user_type != UserType.STUDENT:
        return 0

    subscription = get_subscription(user)

    plan_limit = subscription.plan.consultation_limit
    start_date = subscription.start_date.date()
    end_date = subscription.end_date.date() if subscription.end_date else start_date
    months = months_fraction_or_full(start_date, end_date)

    consultation_limit = plan_limit * months

    consultations_used = Consultation.objects.filter(
        created_at__date__gte=start_date,
        created_at__date__lt=end_date,
        student__user=user,
    ).count()

    consultation_left = consultation_limit - consultations_used
    return max(consultation_left, 0)


def is_user_within_consultation_limit(user):
    return get_user_consultations_left(user) > 0


def send_confirmation_email(request, user, id):
    website_url = get_website_url(request)

    mailer = Mailer(website_url)

    with translation.override(request.LANGUAGE_CODE):
        subject = _("Consultation request confirmation")
        message_1 = _(
            "Hi %(first_name)s, we confirm that we have received your request for a 1:1 consultation with a mentor."
        ) % {"first_name": user.first_name}
        message_2 = _(
            "Our team will contact you shortly to confirm the date and details of your session."
        )
        message_3 = _(
            "If you received this email by mistake or need to contact us regarding your request, please reply to"
        )
        message_4 = _(
            ", and include your request number: %(request_number)s."
            % {"request_number": "{:06d}".format(id)}
        )

    data = {
        "message_1": message_1,
        "message_2": message_2,
        "message_3": message_3,
        "message_4": message_4,
    }

    mailer.send(
        email_template="consultation_confirmation.html",
        to=[user.email],
        bcc=[CONFIG["contact_email"]],
        subject=subject,
        data=data,
        language=request.LANGUAGE_CODE,
    )
