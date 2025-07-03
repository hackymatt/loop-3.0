"use client";

import type { LevelType } from "src/types/course";

import { useState, useEffect } from "react";
import { useBoolean, useSetState } from "minimal-shared/hooks";

import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";

import { useCourse } from "src/api/course/course";
import { useReviews } from "src/api/review/reviews";
import { useSimilarCourses } from "src/api/course/similar";

import { SplashScreen } from "src/components/loading-screen";

import { ReviewList } from "../review/review-list";
import { NotFoundView } from "../error/not-found-view";
import { ReviewSummary } from "../review/review-summary";
import { ReviewNewForm } from "../courses/review-new-form";
import { CourseDetailsHero } from "../courses/course-details-hero";
import { CourseListSimilar } from "../courses/course-list-similar";
import { CourseDetailsSummary } from "../courses/course-details-summary";
import { CongratulationsBanner } from "../courses/congratulations-banner";
import { CourseChatDetailsInfo } from "../courses/course-chat-details-info";
import { CourseDetailsTeachers } from "../courses/course-details-teachers-info";
import { CourseDetailsPrerequisites } from "../courses/course-prerequisites-info";
import { CourseCertificateDetailsInfo } from "../courses/course-certificate-details-info";

// ----------------------------------------------------------------------

export function CourseView({ slug }: { slug: string }) {
  const query = useSetState({
    page: "1",
  });

  const { data: course, isError, isLoading } = useCourse(slug);
  const { data: reviews, count, pageSize } = useReviews(slug);
  const { data: similarCourses } = useSimilarCourses(slug);

  const [showCongratulations, setShowCongratulations] = useState<boolean>(false);

  const openReviewForm = useBoolean();

  useEffect(() => {
    setShowCongratulations((course?.progress || 0) === 100 && course?.reviewed === false);
  }, [course?.progress, course?.reviewed]);

  const renderReview = () => (
    <>
      <ReviewSummary
        slug={slug}
        isCompleted={(course?.progress || 0) === 100}
        ratingNumber={course?.ratingNumber || 0}
        reviewNumber={course?.totalReviews || 0}
        onOpenForm={openReviewForm.onTrue}
      />

      <Container>
        <ReviewList
          reviews={reviews || []}
          recordsCount={count || 0}
          pagesCount={pageSize || 0}
          page={Number(query.state.page) || 1}
          onPageChange={(selectedPage: number) => query.setField("page", String(selectedPage))}
        />
      </Container>

      <ReviewNewForm
        slug={course?.slug || ""}
        open={openReviewForm.value}
        onClose={openReviewForm.onFalse}
      />
    </>
  );

  if (isError) {
    return <NotFoundView />;
  }

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <>
      <CourseDetailsHero
        slug={slug}
        name={course?.name || ""}
        level={course?.level || { slug: "" as unknown as LevelType, name: "" }}
        teachers={course?.teachers || []}
        category={course?.category || { slug: "", name: "" }}
        technology={course?.technology || { slug: "", name: "" }}
        totalPoints={course?.totalPoints || 0}
        totalHours={course?.totalHours || 0}
        description={course?.description || ""}
        ratingNumber={course?.ratingNumber || 0}
        totalReviews={course?.totalReviews || 0}
        totalExercises={course?.totalExercises || 0}
        totalVideos={course?.totalVideos || 0}
        totalQuizzes={course?.totalQuizzes || 0}
        totalLessons={course?.totalLessons || 0}
        totalStudents={course?.totalStudents || 0}
        chapters={course?.chapters || []}
        progress={course?.progress || 0}
      />

      <Container sx={{ py: { xs: 5, md: 10 } }}>
        <Grid container spacing={{ xs: 5, md: 8 }}>
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            {course && <CourseDetailsSummary course={course} />}
          </Grid>

          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <CourseDetailsPrerequisites courses={course?.prerequisites || []} sx={{ mb: 3 }} />

            <CourseDetailsTeachers teachers={course?.teachers || []} sx={{ mb: 3 }} />

            <CourseCertificateDetailsInfo
              slug={slug}
              name={course?.name || ""}
              chapters={course?.chapters || []}
              progress={course?.progress || 0}
              sx={{ mb: 3 }}
            />

            <CourseChatDetailsInfo slug={slug} chatUrl={course?.chatUrl || null} />
          </Grid>
        </Grid>
      </Container>

      <Divider />

      {renderReview()}

      {!!similarCourses?.length && <CourseListSimilar courses={similarCourses} />}

      {showCongratulations && (
        <CongratulationsBanner
          slug={course?.slug || ""}
          open
          onClose={() => {
            setShowCongratulations(false);
          }}
        />
      )}
    </>
  );
}
