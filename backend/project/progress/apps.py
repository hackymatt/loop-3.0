from django.apps import AppConfig


class ProjectProgressConfig(AppConfig):
    name = "project.progress"

    def ready(self):
        import project.progress.signals  # Ensure the signals are connected
