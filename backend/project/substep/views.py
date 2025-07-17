# from rest_framework.mixins import RetrieveModelMixin
# from rest_framework import status, views
# from rest_framework.viewsets import GenericViewSet
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import get_object_or_404
# from django.utils import timezone
# from .models import Substep, ReadingSubstep, VideoSubstep, QuizSubstep, CodingSubstep
# from .serializers import (
#     ReadingSubstepBaseSerializer,
#     ReadingSubstepSerializer,
#     VideoSubstepBaseSerializer,
#     VideoSubstepSerializer,
#     QuizSubstepBaseSerializer,
#     QuizSubstepSerializer,
#     CodingSubstepBaseSerializer,
#     CodingSubstepSerializer,
#     QuizSubstepSubmitSerializer,
#     CodingSubstepSubmitSerializer,
# )
# from ..enrollment.models import ProjectEnrollment, ProjectStepEnrollment
# from ..progress.models import ProjectProgress
# from ..models import Project
# from ..step.models import Step
# from plan.subscription.utils import get_subscription
# from plan.utils import is_default_plan
# from user.type.student_user.models import Student
# from const import SubstepType


# def get_answer(substep, language):
#     specific_model = {
#         SubstepType.QUIZ: QuizSubstep,
#         SubstepType.CODING: CodingSubstep,
#     }.get(substep.type)

#     if substep.type == SubstepType.QUIZ:
#         question = (
#             specific_model.objects.get(substep=substep).get_translation(language).question
#         )
#         answer = [option.is_correct for option in question.options.all()]
#     elif substep.type == SubstepType.CODING:
#         answer = specific_model.objects.get(substep=substep).file.solution
#     else:
#         answer = None

#     return answer


# class SubstepViewSet(RetrieveModelMixin, GenericViewSet):
#     queryset = Substep.objects.select_related("reading", "video", "quiz", "coding")
#     permission_classes = [IsAuthenticated]

#     def retrieve(self, request, *args, **kwargs):
#         project_slug = kwargs.get("project_slug")
#         step_slug = kwargs.get("step_slug")
#         substep_slug = kwargs.get("substep_slug")

#         student = Student.objects.get(user=request.user)
#         project = get_object_or_404(Project, slug=project_slug, active=True)
#         step = get_object_or_404(Step, slug=step_slug, active=True)
#         substep = get_object_or_404(Substep, slug=substep_slug, active=True)

#         if not project.steps.filter(id=step.id).exists():
#             return Response(
#                 {"root": "Step not in this project."},
#                 status=status.HTTP_404_NOT_FOUND,
#             )

#         if not step.substeps.filter(id=substep.id).exists():
#             return Response(
#                 {"root": "Substep not found in this project step."},
#                 status=status.HTTP_404_NOT_FOUND,
#             )

#         ProjectEnrollment.objects.get_or_create(student=student, project=project)

#         substep_model_map = {
#             SubstepType.READING: ReadingSubstep,
#             SubstepType.VIDEO: VideoSubstep,
#             SubstepType.QUIZ: QuizSubstep,
#             SubstepType.CODING: CodingSubstep,
#         }

#         serializer_map = {
#             SubstepType.READING: ReadingSubstepSerializer,
#             SubstepType.VIDEO: VideoSubstepSerializer,
#             SubstepType.QUIZ: QuizSubstepSerializer,
#             SubstepType.CODING: CodingSubstepSerializer,
#         }

#         base_serializer_map = {
#             SubstepType.READING: ReadingSubstepBaseSerializer,
#             SubstepType.VIDEO: VideoSubstepBaseSerializer,
#             SubstepType.QUIZ: QuizSubstepBaseSerializer,
#             SubstepType.CODING: CodingSubstepBaseSerializer,
#         }

#         specific_model = substep_model_map.get(substep.type)
#         specific_substep = specific_model.objects.get(substep=substep)

#         # Plan check: limit access for free users
#         if is_default_plan(get_subscription(student.user).plan):
#             if (
#                 ProjectStepEnrollment.objects.filter(student=student, project=project)
#                 .exclude(step=step)
#                 .exists()
#             ):
#                 base_serializer_class = base_serializer_map.get(substep.type)
#                 serializer = base_serializer_class(
#                     specific_substep, context={"request": request}
#                 )
#                 return Response(serializer.data, status=status.HTTP_403_FORBIDDEN)

#         # Allow full access
#         ProjectStepEnrollment.objects.get_or_create(
#             student=student, project=project, step=step
#         )
#         answer = get_answer(substep, request.LANGUAGE_CODE)
#         ProjectProgress.objects.get_or_create(
#             student=student,
#             substep=substep,
#             defaults={"points": substep.points, "answer": answer},
#         )

#         serializer_class = serializer_map.get(substep.type)
#         serializer = serializer_class(specific_substep, context={"request": request})
#         return Response(serializer.data)


# class SubstepProgressAPIView(views.APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         substep_slug = request.data.pop("substep")
#         substep = get_object_or_404(Substep, slug=substep_slug, active=True)

#         answer = request.data.get("answer")

#         # Save progress
#         student = Student.objects.get(user=request.user)
#         ProjectProgress.objects.update_or_create(
#             student=student,
#             substep=substep,
#             defaults={"answer": answer},
#         )

#         return Response({}, status=status.HTTP_200_OK)


# class SubstepSubmitAPIView(views.APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         substep_slug = request.data.pop("substep")
#         substep = get_object_or_404(Substep, slug=substep_slug, active=True)

#         specific_model = {
#             SubstepType.QUIZ: QuizSubstep,
#             SubstepType.CODING: CodingSubstep,
#         }.get(substep.type)

#         serializer_class = {
#             SubstepType.QUIZ: QuizSubstepSubmitSerializer,
#             SubstepType.CODING: CodingSubstepSubmitSerializer,
#         }.get(substep.type)

#         answer = None
#         if serializer_class:
#             specific_substep = specific_model.objects.get(substep=substep)
#             serializer = serializer_class(
#                 data=request.data,
#                 context={"substep": specific_substep, "request": request},
#             )
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#             answer = serializer.validated_data["answer"]

#         # Save progress
#         student = Student.objects.get(user=request.user)
#         ProjectProgress.objects.update_or_create(
#             student=student,
#             substep=substep,
#             defaults={"answer": answer, "completed_at": timezone.now()},
#         )

#         return Response({}, status=status.HTTP_200_OK)


# class SubstepAnswerAPIView(views.APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         substep_slug = request.data.pop("substep")
#         substep = get_object_or_404(Substep, slug=substep_slug, active=True)

#         answer = get_answer(substep, request.LANGUAGE_CODE)

#         student = Student.objects.get(user=request.user)
#         ProjectProgress.objects.update_or_create(
#             student=student,
#             substep=substep,
#             defaults={"answer": answer, "completed_at": timezone.now(), "points": 0},
#         )

#         return Response({"answer": answer}, status=status.HTTP_200_OK)


# class SubstepHintAPIView(views.APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         substep_slug = request.data.pop("substep")
#         substep = get_object_or_404(Substep, slug=substep_slug, active=True)

#         specific_model = {
#             SubstepType.CODING: CodingSubstep,
#         }.get(substep.type)

#         if substep.type == SubstepType.CODING:
#             specific_substep = specific_model.objects.get(substep=substep)
#             hint = specific_substep.get_translation(request.LANGUAGE_CODE).hint
#             penalty_points = specific_substep.penalty_points
#         else:
#             hint = None
#             penalty_points = 0

#         student = Student.objects.get(user=request.user)
#         ProjectProgress.objects.update_or_create(
#             student=student,
#             substep=substep,
#             defaults={"hint_used": True, "points": substep.points - penalty_points},
#         )

#         return Response({"hint": hint}, status=status.HTTP_200_OK)
