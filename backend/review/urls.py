from .views import (
    ReviewSummaryViewSet,
    ReviewViewSet,
    FeaturedReviewsView,
    SubmitReviewView,
)
from django.urls import path
from const import Urls

urlpatterns = [
    path(
        Urls.COURSE_REVIEW_SUMMARY,
        ReviewSummaryViewSet.as_view({"get": "list"}),
        name="reviews-summary",
    ),
    path(
        Urls.COURSE_REVIEWS,
        ReviewViewSet.as_view({"get": "list"}),
        name="course-reviews",
    ),
    path(Urls.FEATURED_REVIEWS, FeaturedReviewsView.as_view(), name="featured-reviews"),
    path(Urls.REVIEW_SUBMIT, SubmitReviewView.as_view(), name="submit-review"),
]
