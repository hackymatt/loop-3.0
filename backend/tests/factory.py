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
from project.channel.models import ChannelPost, ChannelPostLike, ChannelPostComment
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
payment_intervals = [choice.value for choice in PaymentInterval]
payment_types = [choice.value for choice in PaymentType]
payment_methods = [choice.value for choice in PaymentMethodEnum]
payment_statuses = [choice.value for choice in PaymentStatus]


def _use_if_none(value, fallback):
    return (
        value if value is not None else fallback() if callable(fallback) else fallback
    )


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
    return date + timezone.timedelta(days=_generate_random_number()) * offset


def _create_translations(model, obj, languages, translation_fields, related_field_name):
    translations = {}
    for language in languages:
        translation_data = {
            field: _generate_random_string(50) for field in translation_fields
        }

        translation_data.update(
            {"language": language, related_field_name: obj, **translation_data}
        )

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
    first_name = _use_if_none(first_name, lambda: _generate_random_string(12))
    last_name = _use_if_none(last_name, lambda: _generate_random_string(12))
    email = _use_if_none(email, _generate_random_email)
    username = _use_if_none(username, lambda: get_unique_username(email.split("@")[0]))
    password = _use_if_none(password, lambda: _generate_random_string(12))
    street_address = _use_if_none(street_address, lambda: _generate_random_string(12))
    zip_code = _use_if_none(zip_code, lambda: _generate_random_string(12))
    city = _use_if_none(city, lambda: _generate_random_string(12))
    country = _use_if_none(country, lambda: _generate_random_string(12))
    image = _use_if_none(
        image,
        lambda: SimpleUploadedFile(
            "avatar.jpg",
            b"fake image data",
            content_type="image/jpeg",
        ),
    )
    is_active = _use_if_none(is_active, _generate_random_bool)
    user_type = _use_if_none(user_type, lambda: _generate_random_choice(user_types))

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
    stripe_customer_id=None,
    trial_used=None,
    first_purchase=None,
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
    stripe_customer_id = _use_if_none(stripe_customer_id, _generate_random_string)
    trial_used = _use_if_none(trial_used, _generate_random_bool)
    first_purchase = _use_if_none(first_purchase, _generate_random_bool)

    student = Student.objects.create(
        user=user,
        stripe_customer_id=stripe_customer_id,
        trial_used=trial_used,
        first_purchase=first_purchase,
    )
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
    role=None,
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
    role = _use_if_none(role, lambda: _generate_random_string(5))
    instructor = Instructor.objects.create(user=user, role=role)
    return instructor, password


def create_blog_tag(slug=None):
    slug = _use_if_none(slug, _generate_random_slug)
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
    slug = _use_if_none(slug, _generate_random_slug)
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
    slug = _use_if_none(slug, _generate_random_slug)
    topic = _use_if_none(topic, create_topic)
    image = _use_if_none(
        image,
        lambda: SimpleUploadedFile(
            "avatar.jpg", b"fake image data", content_type="image/jpeg"
        ),
    )
    published_at = _use_if_none(published_at, _generate_random_date)
    author = _use_if_none(author, lambda: create_instructor(is_active=True)[0])
    tags = _use_if_none(
        tags, lambda: [create_blog_tag() for _ in range(_generate_random_number(1, 5))]
    )
    visits = _use_if_none(visits, lambda: _generate_random_number(0, 100))
    active = _use_if_none(active, _generate_random_bool)

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
    slug = _use_if_none(slug, _generate_random_slug)
    category = Category.objects.create(slug=slug)
    _create_translations(CategoryTranslation, category, languages, ["name"], "category")
    return category


def create_level(slug=None, order=None):
    slug = _use_if_none(slug, _generate_random_slug)
    order = _use_if_none(order, _generate_random_number)
    level = Level.objects.create(slug=slug, order=order)
    _create_translations(LevelTranslation, level, languages, ["name"], "level")
    return level


def create_technology(slug=None, name=None):
    slug = _use_if_none(slug, _generate_random_slug)
    name = _use_if_none(name, lambda: _generate_random_string(5))
    technology = Technology.objects.create(slug=slug, name=name)
    return technology


def create_project_tag(slug=None):
    slug = _use_if_none(slug, _generate_random_slug)
    tag = ProjectTag.objects.create(slug=slug)
    _create_translations(ProjectTagTranslation, tag, languages, ["name"], "tag")
    return tag


def create_step(slug=None, points=None, duration=None, active=None):
    slug = _use_if_none(slug, _generate_random_slug)
    points = _use_if_none(points, lambda: _generate_random_number(50, 100))
    duration = _use_if_none(duration, lambda: _generate_random_number(30, 600))
    active = _use_if_none(active, _generate_random_bool)

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
    slug = _use_if_none(slug, _generate_random_slug)
    steps = _use_if_none(
        steps,
        lambda: [
            create_step(active=True) for _ in range(_generate_random_number(10, 15))
        ],
    )
    active = _use_if_none(active, _generate_random_bool)

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
    slug = _use_if_none(slug, _generate_random_slug)
    level = _use_if_none(level, create_level)
    category = _use_if_none(category, create_category)
    technology = _use_if_none(
        technology,
        lambda: [create_technology() for _ in range(_generate_random_number(1, 5))],
    )
    stages = _use_if_none(
        stages,
        lambda: [
            create_stage(active=True) for _ in range(_generate_random_number(5, 10))
        ],
    )
    instructors = _use_if_none(
        instructors,
        lambda: [
            create_instructor(is_active=True)[0]
            for _ in range(_generate_random_number(1, 3))
        ],
    )
    video_url = _use_if_none(video_url, _generate_random_url)
    project_prerequisites = _use_if_none(
        project_prerequisites,
        lambda: [
            create_project(
                active=True,
                project_prerequisites=[],
                blog_prerequisites=[],
                similar=[],
            )
        ],
    )
    blog_prerequisites = _use_if_none(
        blog_prerequisites,
        lambda: [
            create_blog(active=True) for _ in range(_generate_random_number(1, 2))
        ],
    )
    similar = _use_if_none(
        similar,
        lambda: [
            create_project(
                active=True,
                project_prerequisites=[],
                blog_prerequisites=[],
                similar=[],
            )
            for _ in range(_generate_random_number(1, 5))
        ],
    )
    tags = _use_if_none(
        tags,
        lambda: [create_project_tag() for _ in range(_generate_random_number(1, 5))],
    )
    active = _use_if_none(active, _generate_random_bool)

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
    student = _use_if_none(student, lambda: create_student(is_active=True)[0])
    project = _use_if_none(
        project,
        lambda: create_project(
            active=True,
            project_prerequisites=[],
            blog_prerequisites=[],
            similar=[],
        ),
    )
    return ProjectEnrollment.objects.create(student=student, project=project)


def create_project_progress(student=None, step=None, completed_at=None):
    student = _use_if_none(student, lambda: create_student(is_active=True)[0])
    step = _use_if_none(step, lambda: create_step(active=True))
    completed_at = _use_if_none(completed_at, _generate_random_date)

    return ProjectProgress.objects.create(
        student=student, step=step, completed_at=completed_at
    )


def create_review(student=None, project=None, rating=None, language=None, comment=None):
    student = _use_if_none(student, lambda: create_student(is_active=True)[0])
    project = _use_if_none(
        project,
        lambda: create_project(
            active=True,
            project_prerequisites=[],
            blog_prerequisites=[],
            similar=[],
        ),
    )
    rating = _use_if_none(rating, lambda: _generate_random_number(1, 5))
    language = _use_if_none(language, lambda: _generate_random_choice(languages))
    comment = _use_if_none(comment, lambda: _generate_random_string(50))

    return Review.objects.create(
        student=student,
        project=project,
        rating=rating,
        language=language,
        comment=comment,
    )


def create_plan_pricing(
    plan, currency=None, interval=None, price=None, valid_from=None
):
    currency = _use_if_none(currency, lambda: _generate_random_choice(currencies))
    interval = _use_if_none(
        interval, lambda: _generate_random_choice(payment_intervals)
    )

    price = _use_if_none(
        price,
        lambda: 0
        if plan.type == PlanType.FREE
        else _generate_random_number(
            min_val=1 if plan.type == PlanType.BASIC else 100,
            max_val=99 if plan.type == PlanType.BASIC else 1000,
        ),
    )
    valid_from = _use_if_none(valid_from, _generate_random_date)

    return PlanPricing.objects.create(
        plan=plan,
        currency=currency,
        interval=interval,
        price=price,
        valid_from=valid_from,
    )


def create_plan(type=None, popular=None, tokens_limit=None, stripe_product_id=None):
    type = _use_if_none(type, lambda: _generate_random_choice(plan_types))
    popular = _use_if_none(popular, _generate_random_bool)
    tokens_limit = _use_if_none(
        tokens_limit, lambda: _generate_random_number(0, 1000000)
    )
    stripe_product_id = _use_if_none(stripe_product_id, _generate_random_string)

    plan = Plan.objects.create(
        type=type,
        popular=popular,
        tokens_limit=tokens_limit,
        stripe_product_id=stripe_product_id,
    )

    _create_translations(
        PlanTranslation,
        plan,
        languages,
        ["license"],
        "plan",
    )

    for currency in Currency:
        for interval in PaymentInterval:
            create_plan_pricing(plan, currency, interval)

    return plan


def create_plan_option(slug=None):
    slug = _use_if_none(slug, _generate_random_slug)

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
    project = _use_if_none(
        project,
        lambda: create_project(
            active=True,
            project_prerequisites=[],
            blog_prerequisites=[],
            similar=[],
        ),
    )
    student = _use_if_none(student, lambda: create_student(is_active=True)[0])

    return Certificate.objects.create(student=student, project=project)


def create_invoice_customer(
    email=None,
    full_name=None,
    street_address=None,
    city=None,
    zip_code=None,
    country=None,
):
    email = _use_if_none(email, _generate_random_email)
    full_name = _use_if_none(full_name, lambda: _generate_random_string(15))
    street_address = _use_if_none(street_address, lambda: _generate_random_string(15))
    city = _use_if_none(city, lambda: _generate_random_string(15))
    zip_code = _use_if_none(zip_code, lambda: _generate_random_string(15))
    country = _use_if_none(country, lambda: _generate_random_string(15))

    return InvoiceCustomer.objects.create(
        email=email,
        full_name=full_name,
        street_address=street_address,
        city=city,
        zip_code=zip_code,
        country=country,
    )


def create_invoice_item(item_id=None, name=None, price=None, quantity=None):
    item_id = _use_if_none(item_id, lambda: _generate_random_number())
    name = _use_if_none(name, lambda: _generate_random_string(15))
    price = _use_if_none(price, lambda: _generate_random_number(100, 10000) / 100)
    quantity = _use_if_none(quantity, lambda: _generate_random_number())
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
    customer = _use_if_none(customer, create_invoice_customer)
    items = _use_if_none(
        items,
        lambda: [create_invoice_item() for _ in range(_generate_random_number(1, 3))],
    )
    invoice_date = _use_if_none(invoice_date, _generate_random_date)
    service_date = _use_if_none(service_date, _generate_random_date)
    currency = _use_if_none(currency, lambda: _generate_random_choice(currencies))
    status = _use_if_none(status, lambda: _generate_random_choice(payment_statuses))
    method = _use_if_none(method, lambda: _generate_random_choice(payment_methods))
    notes = _use_if_none(notes, _generate_random_string)
    language = _use_if_none(language, lambda: _generate_random_choice(languages))
    auto_generate = _use_if_none(auto_generate, _generate_random_bool)

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


def create_student_invoice(student=None, student_password=None, invoice=None):
    if student is None or student_password is None:
        student, student_password = create_student(is_active=True)
    invoice = _use_if_none(invoice, lambda: create_invoice(auto_generate=False))
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
    brand = _use_if_none(brand, _generate_random_string)
    display_brand = _use_if_none(display_brand, _generate_random_string)
    last4 = _use_if_none(last4, lambda: _generate_random_string(4))
    exp_month = _use_if_none(exp_month, lambda: _generate_random_number(1, 12))
    exp_year = _use_if_none(
        exp_year,
        lambda: _generate_random_number(timezone.now().year, timezone.now().year + 5),
    )
    holder = _use_if_none(holder, _generate_random_string)
    wallet = _use_if_none(wallet, _generate_random_string)

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
    payer_email = _use_if_none(payer_email, _generate_random_email)
    return PayPalPaymentMethod.objects.create(
        payment_method=payment_method, payer_email=payer_email
    )


def create_revolut_payment_method(payment_method):
    return RevolutPaymentMethod.objects.create(payment_method=payment_method)


def create_payment_method(
    student=None,
    student_password=None,
    stripe_payment_method_id=None,
    type=None,
    is_default=None,
):
    if student is None or student_password is None:
        student, student_password = create_student(is_active=True)
    stripe_payment_method_id = _use_if_none(
        stripe_payment_method_id, _generate_random_string
    )
    type = _use_if_none(type, lambda: _generate_random_choice(payment_types))
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
    else:
        specific_payment_method = None

    return payment_method, specific_payment_method, student_password


def create_channel_post(
    project=None, student=None, language=None, title=None, message=None
):
    project = _use_if_none(
        project,
        lambda: create_project(
            active=True,
            project_prerequisites=[],
            blog_prerequisites=[],
            similar=[],
        ),
    )
    student = _use_if_none(student, lambda: create_student(is_active=True)[0])
    language = _use_if_none(language, lambda: _generate_random_choice(languages))
    title = _use_if_none(title, lambda: _generate_random_string())
    message = _use_if_none(message, lambda: _generate_random_string(100))

    return ChannelPost.objects.create(
        project=project,
        student=student,
        language=language,
        title=title,
        message=message,
    )


def create_channel_post_like(channel_post=None, student=None):
    channel_post = _use_if_none(
        channel_post,
        lambda: create_channel_post(),
    )
    student = _use_if_none(student, lambda: create_student(is_active=True)[0])

    return ChannelPostLike.objects.create(channel_post=channel_post, student=student)


def create_channel_post_comment(channel_post=None, student=None, message=None):
    channel_post = _use_if_none(
        channel_post,
        lambda: create_channel_post(),
    )
    student = _use_if_none(student, lambda: create_student(is_active=True)[0])
    message = _use_if_none(message, lambda: _generate_random_string(100))

    return ChannelPostComment.objects.create(
        channel_post=channel_post, student=student, message=message
    )
