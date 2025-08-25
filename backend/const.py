from django.db.models import TextChoices


class Language(TextChoices):
    EN = "en"
    PL = "pl"


class Urls:
    # ROOT
    API = "api"
    ADMIN = "admin"
    MDEDITOR = "mdeditor"
    # AUTH
    REGISTER = "auth/register"
    ACTIVATE = "auth/activate"
    RESEND = "auth/resend"
    LOGIN = "auth/login"
    GOOGLE_LOGIN = "auth/google-login"
    GITHUB_LOGIN = "auth/github-login"
    FACEBOOK_LOGIN = "auth/facebook-login"
    LOGOUT = "auth/logout"
    PASSWORD_RESET = "auth/reset-password"
    PASSWORD_RESET_CONFIRM = "auth/reset-password-confirm"
    REFRESH_TOKEN = "auth/refresh-token"
    # Project
    PROJECT_LEVEL = "project-levels"
    PROJECT_TECHNOLOGY = "project-technologies"
    PROJECT_CATEGORY = "project-categories"
    PROJECT_TAG = "project-tags"
    PROJECT = "projects"
    FEATURED_PROJECT = "featured-projects"
    FEATURED_TECHNOLOGIES = "featured-technologies"
    FEATURED_REVIEWS = "featured-reviews"
    SIMILAR_PROJECTS = "similar-projects/<slug:slug>"
    PROJECT_CHANNEL_POSTS = "project-channel-posts/<slug:slug>"
    PROJECT_CHANNEL_POST_COMMENTS = "project-channel-post-comments/<slug:slug>"
    PROJECT_CHANNEL_POST_LIKES = "project-channel-post-likes/<slug:slug>"
    # STEP
    STEP = "step/<slug:project_slug>/<slug:stage_slug>/<slug:step_slug>"
    STEP_CHAT = "step/chat/<slug:step>"
    # REVIEW
    PROJECT_REVIEW_SUMMARY = "reviews-summary/<slug:slug>"
    PROJECT_REVIEWS = "reviews/<slug:slug>"
    REVIEW_SUBMIT = "review-submit"
    # BLOG
    POST_TOPIC = "post-topics"
    POST_TAG = "post-tags"
    POST = "posts"
    RECENT_POST = "recent-posts"
    FEATURED_POST = "featured-post"
    # PLAN
    PLAN = "plans"
    SUBSCRIBE = "subscribe"
    CREATE_SUBSCRIPTION = "create-subscription"
    STRIPE_WEBHOOK = "stripe-webhook"
    # CONTACT
    CONTACT = "contact"
    # CERTIFICATE
    CERTIFICATE = "certificates"
    # USER
    DATA = "me/data"
    PASSWORD_CHANGE = "me/password"
    DELETE_ACCOUNT = "me/delete"
    SUBSCRIPTION = "me/subscription"
    DASHBOARD = "me/dashboard"


class UserType(TextChoices):
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    STUDENT = "student"


class JoinType(TextChoices):
    EMAIL = "email"
    GOOGLE = "google"
    FACEBOOK = "facebook"
    GITHUB = "github"


class ProjectStatus:
    NOT_STARTED = "not-started"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"


class ProjectDuration:
    SHORT = "short"
    MEDIUM = "medium"
    LONG = "long"


class Currency(TextChoices):
    PLN = "PLN"
    EUR = "EUR"
    USD = "USD"
    GBP = "GBP"


class PlanType(TextChoices):
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"


class PaymentInterval(TextChoices):
    MONTHLY = "monthly"
    YEARLY = "yearly"
