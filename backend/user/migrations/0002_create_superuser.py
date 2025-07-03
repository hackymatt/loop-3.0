from django.db import migrations
from django.contrib.auth import get_user_model
from user.type.admin_user.models import Admin
from global_config import CONFIG
from const import UserType

User = get_user_model()


def generate_superuser(apps, schema_editor):
    email = CONFIG["admin_email"]
    username = email.split("@")[0]
    password = CONFIG["admin_password"]

    if not User.objects.filter(email=email).exists():
        admin = User.objects.create(
            username=username, email=email, user_type=UserType.ADMIN, is_active=True
        )
        admin.set_password(password)
        admin.save()

        Admin.objects.create(user=admin)


def delete_superuser(apps, schema_editor):
    email = CONFIG["admin_email"]

    # Deleting the superuser if it exists
    try:
        admin = User.objects.get(email=email)
        admin.delete()
    except User.DoesNotExist:
        pass

    try:
        admin = Admin.objects.get(user__email=email)
        admin.delete()
    except Admin.DoesNotExist:
        pass


class Migration(migrations.Migration):
    dependencies = [
        ("user", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(generate_superuser, reverse_code=delete_superuser),
    ]
