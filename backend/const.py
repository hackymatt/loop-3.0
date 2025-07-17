from django.db.models import TextChoices


class Language(TextChoices):
    EN = "en"
    PL = "pl"


class Urls:
    # ROOT
    API = "api"
    ADMIN = "admin"
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
    ACCESS_TOKEN = "auth/access-token"
    # Project
    Project_LEVEL = "project-levels"
    Project_TECHNOLOGY = "project-technologies"
    Project_CATEGORY = "project-categories"
    Project = "projects"
    FEATURED_Project = "featured-projects"
    FEATURED_TECHNOLOGIES = "featured-technologies"
    FEATURED_REVIEWS = "featured-reviews"
    SIMILAR_ProjectS = "similar-projects/<slug:slug>"
    # LESSON
    LESSON = "substep/<slug:project_slug>/<slug:step_slug>/<slug:substep_slug>"
    LESSON_PROGRESS = "substep/progress"
    LESSON_SUBMIT = "substep/submit"
    LESSON_ANSWER = "substep/answer"
    LESSON_HINT = "substep/hint"
    # REVIEW
    Project_REVIEW_SUMMARY = "reviews-summary/<slug:slug>"
    Project_REVIEWS = "reviews/<slug:slug>"
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
    # CONTACT
    CONTACT = "contact"
    # CERTIFICATE
    CERTIFICATE = "certificates"
    # USER
    DATA = "me/data"
    PASSWORD_CHANGE = "me/password"
    DELETE_ACCOUNT = "me/delete"
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


class SubstepType(TextChoices):
    READING = "reading"
    VIDEO = "video"
    QUIZ = "quiz"
    CODING = "coding"


class QuizType(TextChoices):
    SINGLE = "single"
    MULTI = "multi"


class ProjectStatus:
    NOT_STARTED = "not-started"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"


class ProjectDuration:
    SHORT = "short"
    MEDIUM = "medium"
    LONG = "long"
