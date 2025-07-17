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
        Urls.PROJECT_REVIEW_SUMMARY,
        ReviewSummaryViewSet.as_view({"get": "list"}),
        name="reviews-summary",
    ),
    path(
        Urls.PROJECT_REVIEWS,
        ReviewViewSet.as_view({"get": "list"}),
        name="project-reviews",
    ),
    path(Urls.FEATURED_REVIEWS, FeaturedReviewsView.as_view(), name="featured-reviews"),
    path(Urls.REVIEW_SUBMIT, SubmitReviewView.as_view(), name="submit-review"),
]
