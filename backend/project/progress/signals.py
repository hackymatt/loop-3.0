from django.db.models.signals import post_save
from django.dispatch import receiver
from certificate.models import Certificate
from ..models import Project
from .models import ProjectProgress
from ..substep.models import Substep


@receiver(post_save, sender=ProjectProgress)
def create_certificate_on_project_completion(sender, instance, **kwargs):
    student = instance.student
    substep = instance.substep

    if instance.completed_at is None:
        return

    # Find all projects that contain this substep through steps
    projects = Project.objects.filter(steps__substeps=substep).distinct()

    for project in projects:
        already_certified = Certificate.objects.filter(
            student=student, project=project
        ).exists()
        if already_certified:
            continue

        # All substeps in the project (via steps)
        project_substeps = Substep.objects.filter(
            stepsubstep__step__in=project.steps.all(), active=True
        ).count()

        # Substeps completed by the student for this project
        completed_substeps = Substep.objects.filter(
            stepsubstep__step__in=project.steps.all(),
            projectprogress__student=student,
        ).count()

        if project_substeps != completed_substeps:
            continue

        Certificate.objects.create(student=student, project=project)
