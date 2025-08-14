"use client";

import type { Language } from "src/locales/types";
import type { IReviewItemProp, IReviewSummaryProps } from "src/types/review";
import type { LevelType, IProjectProps, IProjectListProps } from "src/types/project";

import { useState, useEffect } from "react";
import { useBoolean, useSetState } from "minimal-shared/hooks";

import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";

import { ReviewList } from "../review/review-list";
import { ProjectTags } from "../projects/project-tags";
import { ReviewSummary } from "../review/review-summary";
import { ReviewNewForm } from "../projects/review-new-form";
import { ProjectDetailsHero } from "../projects/project-details-hero";
import { ProjectListSimilar } from "../projects/project-list-similar";
import { ProjectDetailsPreview } from "../projects/project-preview-info";
import { CongratulationsBanner } from "../projects/congratulations-banner";
import { ProjectDetailsSummary } from "../projects/project-details-summary";
import { ProjectChatDetailsInfo } from "../projects/project-chat-details-info";
import { ProjectDetailsTeachers } from "../projects/project-details-teachers-info";
import { ProjectDetailsPrerequisites } from "../projects/project-prerequisites-info";
import { ProjectCertificateDetailsInfo } from "../projects/project-certificate-details-info";

// ----------------------------------------------------------------------
type ProjectViewProps = {
  slug: string;
  data: {
    project: IProjectProps;
    similarProjects: IProjectListProps[];
    reviewsSummary: IReviewSummaryProps[];
    reviews: IReviewItemProp[];
    reviewsCount: number;
    reviewsPageSize: number;
  };
  locale: Language;
};

export function ProjectView({ slug, data, locale }: ProjectViewProps) {
  const query = useSetState({
    page: "1",
  });

  const { project, similarProjects, reviewsSummary, reviews, reviewsCount, reviewsPageSize } = data;

  const [showCongratulations, setShowCongratulations] = useState<boolean>(false);

  const openReviewForm = useBoolean();

  useEffect(() => {
    setShowCongratulations((project.progress || 0) === 100 && project.reviewed === false);
  }, [project.progress, project.reviewed]);

  const renderReview = () => (
    <>
      <ReviewSummary
        reviewsSummary={reviewsSummary}
        isCompleted={(project.progress || 0) === 100}
        ratingNumber={project.ratingNumber || 0}
        reviewNumber={project.totalReviews || 0}
        onOpenForm={openReviewForm.onTrue}
      />

      <Container>
        <ReviewList
          reviews={reviews || []}
          recordsCount={reviewsCount || 0}
          pagesCount={reviewsPageSize || 0}
          page={Number(query.state.page) || 1}
          onPageChange={(selectedPage: number) => query.setField("page", String(selectedPage))}
        />
      </Container>

      <ReviewNewForm
        slug={project.slug || ""}
        open={openReviewForm.value}
        onClose={openReviewForm.onFalse}
      />
    </>
  );

  return (
    <>
      <ProjectDetailsHero
        language={locale}
        slug={slug}
        name={project.name || ""}
        level={project.level || { slug: "" as unknown as LevelType, name: "" }}
        teachers={project.teachers || []}
        category={project.category || { slug: "", name: "" }}
        technologies={project.technologies || []}
        totalPoints={project.totalPoints || 0}
        totalHours={project.totalHours || 0}
        description={project.description || ""}
        ratingNumber={project.ratingNumber || 0}
        totalReviews={project.totalReviews || 0}
        totalStages={project.totalStages || 0}
        totalStudents={project.totalStudents || 0}
        stages={project.stages || []}
        progress={project.progress || 0}
      />

      <Container sx={{ py: { xs: 5, md: 10 } }}>
        <Grid container spacing={{ xs: 5, md: 8 }}>
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <ProjectDetailsSummary project={project} />
          </Grid>

          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            {project.videoUrl && <ProjectDetailsPreview url={project.videoUrl} sx={{ mb: 3 }} />}

            <ProjectDetailsPrerequisites
              prerequisites={project.prerequisites || []}
              sx={{ mb: 3 }}
            />

            <ProjectDetailsTeachers teachers={project.teachers || []} sx={{ mb: 3 }} />

            <ProjectCertificateDetailsInfo
              slug={slug}
              name={project.name || ""}
              stages={project.stages || []}
              progress={project.progress || 0}
              sx={{ mb: 3 }}
            />

            <ProjectChatDetailsInfo slug={slug} />
          </Grid>

          <ProjectTags tags={project.tags || []} />
        </Grid>
      </Container>

      <Divider />

      {renderReview()}

      {!!similarProjects?.length && <ProjectListSimilar projects={similarProjects} />}

      {showCongratulations && (
        <CongratulationsBanner
          slug={project.slug || ""}
          open
          onClose={() => {
            setShowCongratulations(false);
          }}
        />
      )}
    </>
  );
}
