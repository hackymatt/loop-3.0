# from rest_framework.mixins import RetrieveModelMixin
# from rest_framework import status, views
# from rest_framework.viewsets import GenericViewSet
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import get_object_or_404
# from django.utils import timezone
# from .models import Step, ReadingStep, VideoStep, QuizStep, CodingStep
# from .serializers import (
#     ReadingStepBaseSerializer,
#     ReadingStepSerializer,
#     VideoStepBaseSerializer,
#     VideoStepSerializer,
#     QuizStepBaseSerializer,
#     QuizStepSerializer,
#     CodingStepBaseSerializer,
#     CodingStepSerializer,
#     QuizStepSubmitSerializer,
#     CodingStepSubmitSerializer,
# )
# from ..enrollment.models import ProjectEnrollment, ProjectStepEnrollment
# from ..progress.models import ProjectProgress
# from ..models import Project
# from ..step.models import Step
# from plan.subscription.utils import get_subscription
# from plan.utils import is_default_plan
# from user.type.student_user.models import Student
# from const import StepType


# def get_answer(step, language):
#     specific_model = {
#         StepType.QUIZ: QuizStep,
#         StepType.CODING: CodingStep,
#     }.get(step.type)

#     if step.type == StepType.QUIZ:
#         question = (
#             specific_model.objects.get(step=step).get_translation(language).question
#         )
#         answer = [option.is_correct for option in question.options.all()]
#     elif step.type == StepType.CODING:
#         answer = specific_model.objects.get(step=step).file.solution
#     else:
#         answer = None

#     return answer


# class StepViewSet(RetrieveModelMixin, GenericViewSet):
#     queryset = Step.objects.select_related("reading", "video", "quiz", "coding")
#     permission_classes = [IsAuthenticated]

#     def retrieve(self, request, *args, **kwargs):
#         project_slug = kwargs.get("project_slug")
#         step_slug = kwargs.get("step_slug")
#         step_slug = kwargs.get("step_slug")

#         student = Student.objects.get(user=request.user)
#         project = get_object_or_404(Project, slug=project_slug, active=True)
#         step = get_object_or_404(Step, slug=step_slug, active=True)
#         step = get_object_or_404(Step, slug=step_slug, active=True)

#         if not project.steps.filter(id=step.id).exists():
#             return Response(
#                 {"root": "Step not in this project."},
#                 status=status.HTTP_404_NOT_FOUND,
#             )

#         if not step.steps.filter(id=step.id).exists():
#             return Response(
#                 {"root": "Step not found in this project step."},
#                 status=status.HTTP_404_NOT_FOUND,
#             )

#         ProjectEnrollment.objects.get_or_create(student=student, project=project)

#         step_model_map = {
#             StepType.READING: ReadingStep,
#             StepType.VIDEO: VideoStep,
#             StepType.QUIZ: QuizStep,
#             StepType.CODING: CodingStep,
#         }

#         serializer_map = {
#             StepType.READING: ReadingStepSerializer,
#             StepType.VIDEO: VideoStepSerializer,
#             StepType.QUIZ: QuizStepSerializer,
#             StepType.CODING: CodingStepSerializer,
#         }

#         base_serializer_map = {
#             StepType.READING: ReadingStepBaseSerializer,
#             StepType.VIDEO: VideoStepBaseSerializer,
#             StepType.QUIZ: QuizStepBaseSerializer,
#             StepType.CODING: CodingStepBaseSerializer,
#         }

#         specific_model = step_model_map.get(step.type)
#         specific_step = specific_model.objects.get(step=step)

#         # Plan check: limit access for free users
#         if is_default_plan(get_subscription(student.user).plan):
#             if (
#                 ProjectStepEnrollment.objects.filter(student=student, project=project)
#                 .exclude(step=step)
#                 .exists()
#             ):
#                 base_serializer_class = base_serializer_map.get(step.type)
#                 serializer = base_serializer_class(
#                     specific_step, context={"request": request}
#                 )
#                 return Response(serializer.data, status=status.HTTP_403_FORBIDDEN)

#         # Allow full access
#         ProjectStepEnrollment.objects.get_or_create(
#             student=student, project=project, step=step
#         )
#         answer = get_answer(step, request.LANGUAGE_CODE)
#         ProjectProgress.objects.get_or_create(
#             student=student,
#             step=step,
#             defaults={"points": step.points, "answer": answer},
#         )

#         serializer_class = serializer_map.get(step.type)
#         serializer = serializer_class(specific_step, context={"request": request})
#         return Response(serializer.data)


# class StepProgressAPIView(views.APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         step_slug = request.data.pop("step")
#         step = get_object_or_404(Step, slug=step_slug, active=True)

#         answer = request.data.get("answer")

#         # Save progress
#         student = Student.objects.get(user=request.user)
#         ProjectProgress.objects.update_or_create(
#             student=student,
#             step=step,
#             defaults={"answer": answer},
#         )

#         return Response({}, status=status.HTTP_200_OK)


# class StepSubmitAPIView(views.APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         step_slug = request.data.pop("step")
#         step = get_object_or_404(Step, slug=step_slug, active=True)

#         specific_model = {
#             StepType.QUIZ: QuizStep,
#             StepType.CODING: CodingStep,
#         }.get(step.type)

#         serializer_class = {
#             StepType.QUIZ: QuizStepSubmitSerializer,
#             StepType.CODING: CodingStepSubmitSerializer,
#         }.get(step.type)

#         answer = None
#         if serializer_class:
#             specific_step = specific_model.objects.get(step=step)
#             serializer = serializer_class(
#                 data=request.data,
#                 context={"step": specific_step, "request": request},
#             )
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#             answer = serializer.validated_data["answer"]

#         # Save progress
#         student = Student.objects.get(user=request.user)
#         ProjectProgress.objects.update_or_create(
#             student=student,
#             step=step,
#             defaults={"answer": answer, "completed_at": timezone.now()},
#         )

#         return Response({}, status=status.HTTP_200_OK)


# class StepAnswerAPIView(views.APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         step_slug = request.data.pop("step")
#         step = get_object_or_404(Step, slug=step_slug, active=True)

#         answer = get_answer(step, request.LANGUAGE_CODE)

#         student = Student.objects.get(user=request.user)
#         ProjectProgress.objects.update_or_create(
#             student=student,
#             step=step,
#             defaults={"answer": answer, "completed_at": timezone.now(), "points": 0},
#         )

#         return Response({"answer": answer}, status=status.HTTP_200_OK)


# class StepHintAPIView(views.APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         step_slug = request.data.pop("step")
#         step = get_object_or_404(Step, slug=step_slug, active=True)

#         specific_model = {
#             StepType.CODING: CodingStep,
#         }.get(step.type)

#         if step.type == StepType.CODING:
#             specific_step = specific_model.objects.get(step=step)
#             hint = specific_step.get_translation(request.LANGUAGE_CODE).hint
#             penalty_points = specific_step.penalty_points
#         else:
#             hint = None
#             penalty_points = 0

#         student = Student.objects.get(user=request.user)
#         ProjectProgress.objects.update_or_create(
#             student=student,
#             step=step,
#             defaults={"hint_used": True, "points": step.points - penalty_points},
#         )

#         return Response({"hint": hint}, status=status.HTTP_200_OK)
