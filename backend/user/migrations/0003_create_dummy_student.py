from django.db import migrations
from django.contrib.auth import get_user_model
from user.type.student_user.models import Student
from global_config import CONFIG
from const import UserType

User = get_user_model()


def generate_dummy_student(apps, schema_editor):
    email = CONFIG["dummy_student_email"]
    username = email.split("@")[0]
    password = CONFIG["dummy_student_password"]

    if not User.objects.filter(email=email).exists():
        student = User.objects.create(
            username=username, email=email, user_type=UserType.STUDENT, is_active=True
        )
        student.set_password(password)
        student.save()

        Student.objects.create(user=student)


def delete_dummy_student(apps, schema_editor):
    email = CONFIG["admin_email"]

    # Deleting the superuser if it exists
    try:
        student = User.objects.get(email=email)
        student.delete()
    except User.DoesNotExist:
        pass

    try:
        student = Student.objects.get(user__email=email)
        student.delete()
    except Student.DoesNotExist:
        pass


class Migration(migrations.Migration):
    dependencies = [
        ("user", "0002_create_superuser"),
    ]

    operations = [
        migrations.RunPython(generate_dummy_student, reverse_code=delete_dummy_student),
    ]
