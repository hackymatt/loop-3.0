import random
import string
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from django.contrib.auth import get_user_model
from user.utils import get_unique_username
from const import (
    UserType,
    Language,
    PlanType,
    Currency,
    PaymentMethod as PaymentMethodEnum,
    PaymentStatus,
    PaymentType,
    PaymentInterval,
)

from user.type.admin_user.models import Admin
from user.type.instructor_user.models import Instructor
from user.type.student_user.models import Student

from blog.tag.models import Tag as BlogTag, TagTranslation as BlogTagTranslation
from blog.topic.models import Topic, TopicTranslation
from blog.models import Blog, BlogTranslation

from project.category.models import Category, CategoryTranslation
from project.level.models import Level, LevelTranslation
from project.technology.models import Technology
from project.tag.models import (
    Tag as ProjectTag,
    TagTranslation as ProjectTagTranslation,
)
from project.stage.models import Stage, StageTranslation
from project.step.models import Step, StepTranslation
from project.models import Project, ProjectTranslation
from project.enrollment.models import ProjectEnrollment
from project.progress.models import ProjectProgress

from review.models import Review

from plan.models import Plan, PlanTranslation, PlanPricing, Option, OptionTranslation
from plan.subscription.utils import subscribe_free_plan
from plan.payment.models import (
    PaymentMethod,
    CardPaymentMethod,
    PayPalPaymentMethod,
    RevolutPaymentMethod,
    PaymentDiscount,
)

from certificate.models import Certificate

from invoice.models import InvoiceCustomer, InvoiceItem, Invoice, StudentInvoice

languages = [choice.value for choice in Language]
user_types = [choice.value for choice in UserType]
plan_types = [choice.value for choice in PlanType]
currencies = [choice.value for choice in Currency]
payment_types = [choice.value for choice in PaymentType]
payment_methods = [choice.value for choice in PaymentMethodEnum]
payment_statuses = [choice.value for choice in PaymentStatus]


def _generate_random_choice(choices):
    return random.choice(choices)


def _generate_random_string(length=10):
    """Generate a random alphanumeric string of a given length."""
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))


def _generate_random_url(domain=None, path_length=1):
    """Generate a random URL with optional domain and path segments."""
    # Generate domain if not provided
    if domain is None:
        domain_name = _generate_random_string(8).lower()
        tld = random.choice(["com", "net", "org", "io"])
        domain = f"{domain_name}.{tld}"

    # Generate path segments
    path = "/".join(_generate_random_string(5).lower() for _ in range(path_length))

    return f"https://{domain}/{path}"


def _generate_random_number(min_val=1, max_val=100):
    return random.randint(min_val, max_val)


def _generate_random_bool():
    return random.choice([True, False])


def _generate_random_slug():
    return f"{int(timezone.now().timestamp() * 1000)}{_generate_random_string()}"


def _generate_random_email(domain="example.com", length=10):
    local_part = _generate_random_string(length)
    return f"{local_part}@{domain}"


def _generate_random_date(date=timezone.now()):
    offset = -1 if _generate_random_bool() else 1
    return date + timezone.timedelta(day=_generate_random_number()) * offset


def _create_translations(model, obj, languages, translation_fields, related_field_name):
    translations = {}
    for language in languages:
        # Create translation data with random string generation
        translation_data = {
            field: _generate_random_string(50) for field in translation_fields
        }

        # Add the related object (e.g., 'level' or 'topic') dynamically
        translation_data.update(
            {"language": language, related_field_name: obj, **translation_data}
        )

        # Create the translation instance and store it in the dictionary
        translations[language] = model.objects.create(**translation_data)

    return translations


def create_user(
    first_name=None,
    last_name=None,
    email=None,
    username=None,
    password=None,
    street_address=None,
    zip_code=None,
    city=None,
    country=None,
    image=None,
    user_type=None,
    is_active=None,
):
    first_name = first_name or _generate_random_string(12)
    last_name = last_name or _generate_random_string(12)
    email = email or _generate_random_email()
    username = username or get_unique_username(email.split("@")[0])
    password = password or _generate_random_string(12)
    street_address = street_address or _generate_random_string(12)
    zip_code = zip_code or _generate_random_string(12)
    city = city or _generate_random_string(12)
    country = country or _generate_random_string(12)
    image = image or SimpleUploadedFile(
        "avatar.jpg",
        b"fake image data",
        content_type="image/jpeg",
    )
    is_active = is_active or _generate_random_bool()
    user_type = user_type or _generate_random_choice(user_types)

    user = get_user_model().objects.create_user(
        email=email,
        first_name=first_name,
        last_name=last_name,
        street_address=street_address,
        zip_code=zip_code,
        city=city,
        country=country,
        password=password,
        username=username,
        is_active=is_active,
        image=image,
        user_type=user_type,
    )

    return user, password


def create_admin(
    first_name=None,
    last_name=None,
    email=None,
    username=None,
    password=None,
    street_address=None,
    zip_code=None,
    city=None,
    country=None,
    image=None,
    is_active=None,
):
    user, password = create_user(
        first_name=first_name,
        last_name=last_name,
        email=email,
        username=username,
        password=password,
        street_address=street_address,
        zip_code=zip_code,
        city=city,
        country=country,
        image=image,
        user_type=UserType.ADMIN,
        is_active=is_active,
    )
    admin = Admin.objects.create(user=user)
    return admin, password


def create_student(
    first_name=None,
    last_name=None,
    email=None,
    username=None,
    password=None,
    street_address=None,
    zip_code=None,
    city=None,
    country=None,
    image=None,
    is_active=None,
):
    user, password = create_user(
        first_name=first_name,
        last_name=last_name,
        email=email,
        username=username,
        password=password,
        street_address=street_address,
        zip_code=zip_code,
        city=city,
        country=country,
        image=image,
        user_type=UserType.STUDENT,
        is_active=is_active,
    )
    student = Student.objects.create(user=user)
    subscribe_free_plan(student)
    return student, password


def create_instructor(
    first_name=None,
    last_name=None,
    email=None,
    username=None,
    password=None,
    street_address=None,
    zip_code=None,
    city=None,
    country=None,
    image=None,
    is_active=None,
):
    user, password = create_user(
        first_name=first_name,
        last_name=last_name,
        email=email,
        username=username,
        password=password,
        street_address=street_address,
        zip_code=zip_code,
        city=city,
        country=country,
        image=image,
        user_type=UserType.INSTRUCTOR,
        is_active=is_active,
    )
    role = _generate_random_string(5)
    instructor = Instructor.objects.create(user=user, role=role)
    return instructor, password


def create_blog_tag(slug=None):
    slug = slug or _generate_random_slug()
    tag = BlogTag.objects.create(slug=slug)

    _create_translations(
        BlogTagTranslation,
        tag,
        languages,
        ["name"],
        "tag",
    )

    return tag


def create_topic(slug=None):
    slug = slug or _generate_random_slug()
    topic = Topic.objects.create(slug=slug)
    _create_translations(TopicTranslation, topic, languages, ["name"], "topic")
    return topic


def create_blog(
    slug=None,
    topic=None,
    image=None,
    published_at=None,
    author=None,
    tags=None,
    visits=None,
    active=None,
):
    slug = slug or _generate_random_slug()
    topic = topic or create_topic()
    image = image or SimpleUploadedFile(
        "avatar.jpg",
        b"fake image data",
        content_type="image/jpeg",
    )
    published_at = published_at or _generate_random_date()
    author = author or create_instructor(is_active=True)[0]
    tags = tags or [create_blog_tag() for _ in range(_generate_random_number(1, 5))]
    visits = visits or _generate_random_number(0, 100)
    active = active or _generate_random_bool()

    blog = Blog.objects.create(
        slug=slug,
        topic=topic,
        image=image,
        published_at=published_at,
        author=author,
        visits=visits,
        active=active,
    )
    blog.tags.add(*tags)

    _create_translations(
        BlogTranslation, blog, languages, ["name", "description", "content"], "blog"
    )
    return blog


def create_category(slug=None):
    slug = slug or _generate_random_slug()
    category = Category.objects.create(slug=slug)
    _create_translations(CategoryTranslation, category, languages, ["name"], "category")
    return category


def create_level(slug=None, order=None):
    slug = slug or _generate_random_slug()
    order = order or _generate_random_number()
    level = Level.objects.create(slug=slug, order=order)
    _create_translations(LevelTranslation, level, languages, ["name"], "level")
    return level


def create_technology(slug=None, name=None):
    slug = slug or _generate_random_slug()
    name = name or _generate_random_string(5)
    technology = Technology.objects.create(slug=slug, name=name)
    return technology


def create_project_tag(slug=None):
    slug = slug or _generate_random_slug()
    tag = ProjectTag.objects.create(slug=slug)
    _create_translations(ProjectTagTranslation, tag, languages, ["name"], "tag")
    return tag


def create_step(slug=None, points=None, duration=None, active=None):
    slug = slug or _generate_random_slug()
    points = points or _generate_random_number(50, 100)
    duration = duration or _generate_random_number(30, 600)
    active = active or _generate_random_bool()

    step = Step.objects.create(
        slug=slug, points=points, duration=duration, active=active
    )
    _create_translations(
        StepTranslation,
        step,
        languages,
        ["name", "text"],
        "step",
    )

    return step


def create_stage(slug=None, steps=None, active=None):
    slug = slug or _generate_random_slug()
    steps = steps or [
        create_step(active=True) for _ in range(_generate_random_number(10, 15))
    ]
    active = active or _generate_random_bool()
    stage = Stage.objects.create(slug=slug, active=active)
    stage.steps.add(*steps)

    _create_translations(
        StageTranslation, stage, languages, ["name", "description"], "stage"
    )
    return stage


def create_project(
    slug=None,
    level=None,
    category=None,
    technology=None,
    stages=None,
    instructors=None,
    video_url=None,
    project_prerequisites=None,
    blog_prerequisites=None,
    similar=None,
    tags=None,
    active=None,
):
    slug = slug or _generate_random_slug()
    level = level or create_level()
    category = category or create_category()
    technology = technology or [
        create_technology() for _ in range(_generate_random_number(1, 5))
    ]
    stages = stages or [
        create_stage(active=True) for _ in range(_generate_random_number(5, 10))
    ]
    instructors = instructors or [
        create_instructor(is_active=True)[0]
        for _ in range(_generate_random_number(1, 3))
    ]
    video_url = video_url or _generate_random_url()
    project_prerequisites = project_prerequisites or [
        create_project(active=True, project_prerequisites=[], blog_prerequisites=[])
    ]
    blog_prerequisites = blog_prerequisites or [
        create_blog(active=True) for _ in range(_generate_random_number(1, 2))
    ]
    similar = similar or [
        create_project(active=True, project_prerequisites=[], blog_prerequisites=[])
        for _ in range(_generate_random_number(1, 5))
    ]
    tags = tags or [create_project_tag() for _ in range(_generate_random_number(1, 5))]
    active = active or _generate_random_bool()

    project = Project.objects.create(
        slug=slug,
        level=level,
        category=category,
        video_url=video_url,
        active=active,
    )
    project.technology.add(*technology)
    project.stages.add(*stages)
    project.instructors.add(*instructors)
    project.project_prerequisites.add(*project_prerequisites)
    project.blog_prerequisites.add(*blog_prerequisites)
    project.similar.add(*similar)
    project.tags.add(*tags)

    _create_translations(
        ProjectTranslation,
        project,
        languages,
        ["name", "description", "overview"],
        "project",
    )
    return project


def create_project_enrollment(student=None, project=None):
    student = student or create_student(is_active=True)[0]
    project = project or create_project(
        active=True, project_prerequisites=[], blog_prerequisites=[]
    )

    return ProjectEnrollment.objects.create(student=student, project=project)


def create_project_progress(student=None, step=None, completed_at=None):
    student = student or create_student(is_active=True)[0]
    step = step or create_step(active=True)
    completed_at = completed_at or _generate_random_date()

    return ProjectProgress.objects.create(
        student=student, step=step, completed_at=completed_at
    )


def create_review(student=None, project=None, rating=None, language=None, comment=None):
    student, _ = student or create_student(is_active=True)
    project = project or create_project(
        active=True, project_prerequisites=[], blog_prerequisites=[]
    )
    rating = rating or _generate_random_number(1, 5)
    language = language or _generate_random_choice(languages)
    comment = comment or _generate_random_string(50)

    review = Review.objects.create(
        student=student,
        project=project,
        rating=rating,
        language=language,
        comment=comment,
    )
    return review


def create_plan(type=None, popular=None, tokens_limit=None, stripe_product_id=None):
    type = type or _generate_random_choice(plan_types)
    popular = popular or _generate_random_bool()
    tokens_limit = tokens_limit or _generate_random_number(0, 1000000)
    stripe_product_id = stripe_product_id or _generate_random_string()

    plan = Plan.objects.create(
        type=type,
        popular=popular,
        tokens_limit=tokens_limit,
        stripe_product_id=stripe_product_id,
    )

    translations = {}
    for language in languages:
        translations[language] = PlanTranslation.objects.create(
            language=language,
            plan=plan,
            license=license,
        )

    for currency in Currency:
        for interval in PaymentInterval:
            PlanPricing.objects.create(
                plan=plan,
                currency=currency,
                interval=interval,
                price=0,
                valid_from=timezone.now(),
            )

    return plan


def create_plan_option(slug=None):
    slug = slug or _generate_random_slug()

    plan_option = Option.objects.create(slug=slug)

    _create_translations(
        OptionTranslation,
        plan_option,
        languages,
        ["title"],
        "option",
    )

    return plan_option


def create_certificate(project=None, student=None):
    project = project or create_project(
        active=True, project_prerequisites=[], blog_prerequisites=[]
    )
    student, _ = student or create_student(is_active=True)

    return Certificate.objects.create(student=student, project=project)


def create_invoice_customer(
    email=None,
    full_name=None,
    street_address=None,
    city=None,
    zip_code=None,
    country=None,
):
    email = email or _generate_random_email()
    full_name = full_name or _generate_random_string(15)
    street_address = street_address or _generate_random_string(15)
    city = city or _generate_random_string(15)
    zip_code = zip_code or _generate_random_string(15)
    country = country or _generate_random_string(15)

    return InvoiceCustomer.objects.create(
        email=email,
        full_name=full_name,
        street_address=street_address,
        city=city,
        zip_code=zip_code,
        country=country,
    )


def create_invoice_item(item_id=None, name=None, price=None, quantity=None):
    item_id = item_id or _generate_random_number()
    name = name or _generate_random_string(15)
    price = price or _generate_random_number(100, 10000) / 100
    quantity = quantity or _generate_random_number()
    return InvoiceItem.objects.create(
        item_id=item_id, name=name, price=price, quantity=quantity
    )


def create_invoice(
    customer=None,
    items=None,
    invoice_date=None,
    service_date=None,
    currency=None,
    status=None,
    method=None,
    notes=None,
    language=None,
    auto_generate=None,
):
    customer = customer or create_invoice_customer()
    items = items or [
        create_invoice_item() for _ in range(_generate_random_number(1, 3))
    ]
    invoice_date = invoice_date or _generate_random_date()
    service_date = service_date or _generate_random_date()
    currency = currency or _generate_random_choice(currencies)
    status = status or _generate_random_choice(payment_statuses)
    method = method or _generate_random_choice(payment_methods)
    notes = notes or _generate_random_string()
    language = language or _generate_random_choice(languages)
    auto_generate = auto_generate or _generate_random_bool()

    invoice = Invoice.objects.create(
        customer=customer,
        invoice_date=invoice_date,
        service_date=service_date,
        currency=currency,
        status=status,
        method=method,
        notes=notes,
        language=language,
        auto_generate=auto_generate,
    )
    invoice.items.add(*items)

    return invoice


def create_student_invoice(student=None, invoice=None):
    student, student_password = student or create_student(is_active=True)
    invoice = invoice or create_invoice()
    student_invoice = StudentInvoice.objects.create(student=student, invoice=invoice)
    return student_invoice, student_password


def create_card_payment_method(
    payment_method,
    brand=None,
    display_brand=None,
    last4=None,
    exp_month=None,
    exp_year=None,
    holder=None,
    wallet=None,
):
    brand = brand or _generate_random_string()
    display_brand = display_brand or _generate_random_string()
    last4 = last4 or _generate_random_string(4)
    exp_month = exp_month or _generate_random_number(1, 12)
    exp_year = exp_year or _generate_random_number(
        timezone.now().year, timezone.now().year + 5
    )
    holder = holder or _generate_random_string()
    wallet = wallet or _generate_random_string()

    return CardPaymentMethod.objects.create(
        payment_method=payment_method,
        brand=brand,
        display_brand=display_brand,
        last4=last4,
        exp_month=exp_month,
        exp_year=exp_year,
        holder=holder,
        wallet=wallet,
    )


def create_paypal_payment_method(payment_method, payer_email=None):
    payer_email = payer_email or _generate_random_email()
    return PayPalPaymentMethod.objects.create(
        payment_method=payment_method, payer_email=payer_email
    )


def create_revolut_payment_method(payment_method):
    return RevolutPaymentMethod.objects.create(payment_method=payment_method)


def create_payment_method(
    student=None,
    stripe_payment_method_id=None,
    type=None,
    is_default=None,
):
    student, student_password = student or create_student(is_active=True)
    stripe_payment_method_id = stripe_payment_method_id or _generate_random_string(50)
    type = type or _generate_random_choice(payment_types)
    is_default = is_default if is_default is not None else _generate_random_bool()

    payment_method = PaymentMethod.objects.create(
        student=student,
        stripe_payment_method_id=stripe_payment_method_id,
        type=type,
        is_default=is_default,
    )

    if type == PaymentType.CARD:
        specific_payment_method = create_card_payment_method(payment_method)
    elif type == PaymentType.PAYPAL:
        specific_payment_method = create_paypal_payment_method(payment_method)
    elif type == PaymentType.REVOLUT:
        specific_payment_method = create_revolut_payment_method(payment_method)

    return payment_method, specific_payment_method, student_password
