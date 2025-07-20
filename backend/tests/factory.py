# import random
# import string
# from django.utils import timezone
# from django.contrib.auth import get_user_model
# from user.utils import get_unique_username
# from const import UserType, Language, StepType, QuizType

# from user.type.admin_user.models import Admin
# from user.type.instructor_user.models import Instructor
# from user.type.student_user.models import Student

# from blog.tag.models import Tag, TagTranslation
# from blog.topic.models import Topic, TopicTranslation
# from blog.models import Blog, BlogTranslation

# from project.category.models import Category, CategoryTranslation
# from project.level.models import Level, LevelTranslation
# from project.technology.models import Technology
# from project.step.models import Step, StepTranslation
# from project.step.models import (
#     Step,
#     QuizStep,
#     QuizStepTranslation,
#     QuizQuestion,
#     QuizQuestionOption,
#     ReadingStep,
#     ReadingStepTranslation,
#     VideoStep,
#     VideoStepTranslation,
#     File,
#     CodingStep,
#     CodingStepTranslation,
# )
# from project.models import Project, ProjectTranslation

# from review.models import Review

# from plan.models import Plan, PlanTranslation, Option, OptionTranslation
# from plan.subscription.utils import subscribe_free_plan

# from certificate.models import Certificate

# languages = [choice.value for choice in Language]


# def _generate_random_string(length=10):
#     """Generate a random alphanumeric string of a given length."""
#     return "".join(random.choices(string.ascii_letters + string.digits, k=length))


# def _generate_random_number(min_val=1, max_val=100):
#     return random.randint(min_val, max_val)


# def _generate_random_bool():
#     return random.choice([True, False])


# def _generate_random_slug():
#     return f"{int(timezone.now().timestamp() * 1000)}{_generate_random_string()}"


# def _generate_random_email(domain="example.com", length=10):
#     local_part = _generate_random_string(length)
#     return f"{local_part}@{domain}"


# def _generate_random_url(domain="example.com"):
#     return f"https://{domain}/{_generate_random_string(10)}"


# def _create_translations(model, obj, languages, translation_fields, related_field_name):
#     translations = {}
#     for language in languages:
#         # Create translation data with random string generation
#         translation_data = {
#             field: _generate_random_string(50) for field in translation_fields
#         }

#         # Add the related object (e.g., 'level' or 'topic') dynamically
#         translation_data.update(
#             {"language": language, related_field_name: obj, **translation_data}
#         )

#         # Create the translation instance and store it in the dictionary
#         translations[language] = model.objects.create(**translation_data)

#     return translations


# def create_user():
#     first_name = _generate_random_string(12)
#     last_name = _generate_random_string(12)
#     email = _generate_random_email()
#     username = get_unique_username(email.split("@")[0])
#     password = _generate_random_string(12)

#     user = get_user_model().objects.create_user(
#         email=email,
#         first_name=first_name,
#         last_name=last_name,
#         password=password,
#         username=username,
#         is_active=True,
#     )

#     return user, password


# def create_user_with_type(user_type):
#     user, password = create_user()
#     user.user_type = user_type
#     user.save()
#     return user, password


# def create_admin_user():
#     return create_user_with_type(UserType.ADMIN)


# def create_student_user():
#     return create_user_with_type(UserType.STUDENT)


# def create_instructor_user():
#     return create_user_with_type(UserType.INSTRUCTOR)


# def create_admin():
#     user, password = create_user_with_type(UserType.ADMIN)
#     admin = Admin.objects.create(user=user)
#     return admin, password


# def create_student():
#     user, password = create_user_with_type(UserType.STUDENT)
#     student = Student.objects.create(user=user)
#     subscribe_free_plan(student)
#     return student, password


# def create_instructor():
#     user, password = create_user_with_type(UserType.INSTRUCTOR)
#     role = _generate_random_string(5)
#     instructor = Instructor.objects.create(user=user, role=role)
#     return instructor, password


# def create_tag():
#     slug = _generate_random_slug()
#     tag = Tag.objects.create(slug=slug)
#     _create_translations(TagTranslation, tag, languages, ["name"], "tag")
#     return tag


# def create_topic():
#     slug = _generate_random_slug()
#     topic = Topic.objects.create(slug=slug)
#     _create_translations(TopicTranslation, topic, languages, ["name"], "topic")
#     return topic


# def create_blog():
#     slug = _generate_random_slug()
#     topic = create_topic()
#     tags = [create_tag() for _ in range(_generate_random_number())]
#     instructor, _ = create_instructor()
#     published_at = timezone.now()

#     blog = Blog.objects.create(
#         slug=slug,
#         topic=topic,
#         author=instructor,
#         published_at=published_at,
#         active=True,
#     )
#     blog.tags.add(*tags)

#     _create_translations(
#         BlogTranslation, blog, languages, ["name", "description", "content"], "blog"
#     )
#     return blog


# def create_category():
#     slug = _generate_random_slug()
#     category = Category.objects.create(slug=slug)
#     _create_translations(CategoryTranslation, category, languages, ["name"], "category")
#     return category


# def create_level():
#     slug = _generate_random_slug()
#     level = Level.objects.create(slug=slug)
#     _create_translations(LevelTranslation, level, languages, ["name"], "level")
#     return level


# def create_technology():
#     slug = _generate_random_slug()
#     name = _generate_random_string(5)
#     technology = Technology.objects.create(slug=slug, name=name)
#     return technology


# def create_file():
#     name = _generate_random_string(5)
#     path = _generate_random_string(15)
#     code = _generate_random_string(100)
#     solution = _generate_random_string(100)
#     file = File.objects.create(name=name, path=path, code=code, solution=solution)
#     return file


# def create_step(step_type=None):
#     slug = _generate_random_slug()
#     points = _generate_random_number(50, 100)

#     if not step_type:
#         step_type = random.choice(
#             [StepType.READING, StepType.VIDEO, StepType.QUIZ, StepType.CODING]
#         )

#     step = Step.objects.create(
#         slug=slug, points=points, type=step_type, active=True
#     )
#     specific_step, translations = None, {}

#     if step_type == StepType.READING:
#         specific_step = ReadingStep.objects.create(step=step)
#         _create_translations(
#             ReadingStepTranslation,
#             specific_step,
#             languages,
#             ["name", "text"],
#             "step",
#         )
#     elif step_type == StepType.VIDEO:
#         video_url = _generate_random_url()
#         specific_step = VideoStep.objects.create(step=step, video_url=video_url)
#         _create_translations(
#             VideoStepTranslation, specific_step, languages, ["name"], "step"
#         )
#     elif step_type == StepType.QUIZ:
#         quiz_type = random.choice([QuizType.SINGLE, QuizType.MULTI])
#         specific_step = QuizStep.objects.create(step=step, quiz_type=quiz_type)
#         translations = _create_translations(
#             QuizStepTranslation,
#             specific_step,
#             languages,
#             ["name"],
#             "step",
#         )
#         for language in languages:
#             translation = translations[language]
#             text = _generate_random_string()
#             question = QuizQuestion.objects.create(translation=translation, text=text)
#             for _ in range(_generate_random_number(1, 5)):
#                 text = _generate_random_string()
#                 is_correct = _generate_random_bool()
#                 QuizQuestionOption.objects.create(
#                     question=question, text=text, is_correct=is_correct
#                 )

#     elif step_type == StepType.CODING:
#         file = create_file()
#         test_file = create_file()
#         files = [create_file() for _ in range(_generate_random_number(1, 5))]
#         command = _generate_random_string()
#         test_command = _generate_random_string()
#         timeout = _generate_random_number()
#         penalty_points = _generate_random_number(0, 50)
#         technology = create_technology()
#         specific_step = CodingStep.objects.create(
#             step=step,
#             technology=technology,
#             file=file,
#             command=command,
#             test_file=test_file,
#             test_command=test_command,
#             timeout=timeout,
#             penalty_points=penalty_points,
#         )
#         specific_step.files.add(*files)
#         _create_translations(
#             CodingStepTranslation,
#             specific_step,
#             languages,
#             ["name", "introduction", "instructions", "hint"],
#             "step",
#         )

#     return step, specific_step


# def create_step():
#     slug = _generate_random_slug()
#     steps = [create_step()[0] for _ in range(_generate_random_number(10, 15))]
#     step = Step.objects.create(slug=slug, active=True)
#     step.steps.add(*steps)

#     _create_translations(
#         StepTranslation, step, languages, ["name", "description"], "step"
#     )
#     return step


# def create_project():
#     slug = _generate_random_slug()
#     technology = create_technology()
#     level = create_level()
#     category = create_category()
#     duration = _generate_random_number()
#     chat_url = _generate_random_url()
#     steps = [create_step() for _ in range(_generate_random_number(5, 10))]
#     instructors = [create_instructor()[0] for _ in range(_generate_random_number(1, 3))]

#     project = Project.objects.create(
#         slug=slug,
#         technology=technology,
#         level=level,
#         category=category,
#         duration=duration,
#         chat_url=chat_url,
#         active=True,
#     )
#     project.instructors.add(*instructors)
#     project.steps.add(*steps)

#     _create_translations(
#         ProjectTranslation,
#         project,
#         languages,
#         ["name", "description", "overview"],
#         "project",
#     )
#     return project


# def create_review():
#     student, _ = create_student()
#     project = create_project()
#     rating = _generate_random_number(1, 5)
#     language = random.choice(languages)
#     comment = _generate_random_string(50)

#     review = Review.objects.create(
#         student=student,
#         project=project,
#         rating=rating,
#         language=language,
#         comment=comment,
#     )
#     return review


# def create_plan():
#     slug = _generate_random_slug()
#     popular = _generate_random_bool()
#     premium = _generate_random_bool()
#     monthly_price = _generate_random_number(10, 20)
#     yearly_price = _generate_random_number(100, 200)

#     plan = Plan.objects.create(
#         slug=slug,
#         popular=popular,
#         premium=premium,
#         monthly_price=monthly_price,
#         yearly_price=yearly_price,
#     )

#     _create_translations(
#         PlanTranslation,
#         plan,
#         languages,
#         ["license"],
#         "plan",
#     )

#     return plan


# def create_plan_option():
#     slug = _generate_random_slug()

#     plan_option = Option.objects.create(slug=slug)

#     _create_translations(
#         OptionTranslation,
#         plan_option,
#         languages,
#         ["title"],
#         "option",
#     )

#     return plan_option


# def create_certificate():
#     project = create_project()
#     student, _ = create_student()

#     return Certificate.objects.create(student=student, project=project)
