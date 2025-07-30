from django.db.models.signals import post_save
from django.dispatch import receiver
from certificate.models import Certificate
from ..models import Project
from .models import ProjectProgress
from ..step.models import Step


@receiver(post_save, sender=ProjectProgress)
def create_certificate_on_project_completion(sender, instance, **kwargs):
    student = instance.student
    step = instance.step

    # Find all projects that contain this step through stages
    projects = Project.objects.filter(stages__steps=step).distinct()

    for project in projects:
        already_certified = Certificate.objects.filter(
            student=student, project=project
        ).exists()
        if already_certified:
            continue

        # All steps in the project (via stages)
        project_steps = Step.objects.filter(
            stagestep__stage__in=project.stages.all(), active=True
        ).count()

        # Steps completed by the student for this project
        completed_steps = Step.objects.filter(
            stagestep__stage__in=project.stages.all(),
            projectprogress__student=student,
        ).count()

        if project_steps != completed_steps:
            continue

        Certificate.objects.create(student=student, project=project)
