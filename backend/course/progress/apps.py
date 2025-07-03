from django.apps import AppConfig


class CourseProgressConfig(AppConfig):
    name = "course.progress"

    def ready(self):
        import course.progress.signals  # Ensure the signals are connected
