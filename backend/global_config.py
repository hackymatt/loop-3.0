from django.conf import settings
from const import PlanType

CONFIG = {
    "secret": settings.SECRET_KEY,
    "is_local": settings.LOCAL,
    "language": settings.LANGUAGE_CODE,
    "storages": settings.STORAGES,
    "admin_email": settings.ADMIN_EMAIL,
    "admin_password": settings.ADMIN_PASSWORD,
    "contact_email": settings.CONTACT_EMAIL,
    "noreply_email": settings.NOREPLY_EMAIL,
    "words_per_minute": 200,
    "dummy_student_email": settings.DUMMY_STUDENT_EMAIL,
    "dummy_student_password": settings.DUMMY_STUDENT_PASSWORD,
    "google_credentials": settings.GOOGLE_CREDENTIALS,
    "open_ai_api_key": settings.OPENAI_API_KEY,
    "stripe_secret_key": settings.STRIPE_SECRET_KEY,
    "stripe_webhook_secret": settings.STRIPE_WEBHOOK_SECRET,
    "min_password_length": settings.MIN_PASSWORD_LENGTH,
    "default_plan": PlanType.FREE,
    "free_trial_days": 7,
    "website_url": "https://loop.edu.pl",
    "vat_limit": 11,
    "vat_rate": 23,
    "s3": {
        "access_key": settings.AWS_ACCESS_KEY,
        "secret_key": settings.AWS_SECRET_KEY,
        "bucket_name": settings.AWS_STORAGE_BUCKET_NAME,
        "region_name": settings.AWS_S3_REGION_NAME,
        "endpoint_url": settings.AWS_S3_ENDPOINT_URL,
    },
    "invoice_location": settings.INVOICE_LOCATION,
}
