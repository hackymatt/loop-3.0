from django.core.management import call_command, CommandError
from project.channel.utils import remove_unused_images


def create_backup():
    try:
        call_command("dbbackup")
    except CommandError:
        pass


def remove_images():
    try:
        remove_unused_images()
    except Exception:
        pass
