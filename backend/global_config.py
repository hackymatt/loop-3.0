from django.conf import settings

CONFIG = {
    "secret": settings.SECRET_KEY,
    "is_local": settings.LOCAL,
    "broker_url": settings.BROKER_URL,
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
    "min_password_length": settings.MIN_PASSWORD_LENGTH,
    "default_plan": "free",
}
