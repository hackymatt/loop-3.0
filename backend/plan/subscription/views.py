from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SubscriptionSerializer, UserSubscription
from .utils import subscribe
from ..models import Plan
from user.type.student_user.models import Student
from plan.models import Plan
from plan.utils import is_default_plan
from django.shortcuts import get_object_or_404
from dateutil.relativedelta import relativedelta
from django.utils import timezone


class SubscribeView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = SubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_data = serializer.validated_data.get("user")
        plan_slug = serializer.validated_data.get("plan")
        interval = serializer.validated_data.get("interval")
        is_yearly = interval == "yearly"

        user = request.user
        user.first_name = user_data["first_name"]
        user.last_name = user_data["last_name"]
        user.save()

        plan = get_object_or_404(Plan, slug=plan_slug)
        student = Student.objects.get(user=user)

        if is_default_plan(plan):
            end_date = None
        else:
            if is_yearly:
                end_date = timezone.now() + relativedelta(years=1)
            else:
                end_date = timezone.now() + relativedelta(months=1)

        subscription = subscribe(student=student, plan=plan, end_date=end_date)

        return Response(UserSubscription(subscription).data, status=status.HTTP_200_OK)
