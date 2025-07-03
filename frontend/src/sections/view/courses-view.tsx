"use client";

import type { ICourseStatusProp } from "src/types/course";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { useQueryParams } from "src/hooks/use-query-params";

import { useCourses } from "src/api/course/courses";
import { useCourseLevels } from "src/api/course/level/levels";
import { useCourseCategories } from "src/api/course/category/categories";
import { useCourseTechnologies } from "src/api/course/technology/technologies";

import { Iconify } from "src/components/iconify";
import { SplashScreen } from "src/components/loading-screen";

import { CourseList } from "../courses/course-list";
import { CoursesFilters } from "../courses/courses-filters";

// ----------------------------------------------------------------------

const RATING_OPTIONS = ["4", "3", "2"];

// ----------------------------------------------------------------------

export function CoursesView() {
  const { t } = useTranslation("course");

  const statusOptions = t("filter.status.options", { returnObjects: true }) as ICourseStatusProp[];

  const { handleChange, query } = useQueryParams();

  const { data: courseLevels, isLoading: isLoadingLevels } = useCourseLevels({
    sort_by: "order",
    page_size: "-1",
  });
  const { data: courseTechnologies, isLoading: isLoadingTechnologies } = useCourseTechnologies({
    page_size: "-1",
  });
  const { data: courseCategories, isLoading: isLoadingCategories } = useCourseCategories({
    page_size: "-1",
  });
  const { data: courses, count, pageSize, isLoading: isLoadingCourse } = useCourses(query);

  const openMobile = useBoolean();

  const renderHead = () => (
    <Box sx={{ display: "flex", alignItems: "center", py: 5 }}>
      <Typography variant="h3" sx={{ flexGrow: 1 }}>
        {t("title")}
      </Typography>

      <Iconify
        width={18}
        icon="solar:filter-outline"
        onClick={openMobile.onTrue}
        sx={{ display: { md: "none" } }}
      />
    </Box>
  );

  const renderListView = () => (
    <Box sx={{ gap: 4, display: "flex", flexDirection: "column" }}>
      <CourseList
        courses={courses ?? []}
        recordsCount={count || 0}
        pagesCount={pageSize || 0}
        page={Number(query.page) || 1}
        onPageChange={(selectedPage: number) => handleChange("page", String(selectedPage))}
      />
    </Box>
  );

  const renderFilters = () => (
    <Box sx={{ flexShrink: 0, width: { md: 280 } }}>
      <CoursesFilters
        open={openMobile.value}
        onClose={openMobile.onFalse}
        options={{
          levels: courseLevels ?? [],
          technologies: courseTechnologies ?? [],
          categories: courseCategories ?? [],
          ratings: RATING_OPTIONS,
          statuses: statusOptions,
        }}
      />
    </Box>
  );

  if (isLoadingLevels || isLoadingTechnologies || isLoadingCategories || isLoadingCourse) {
    return <SplashScreen />;
  }

  return (
    <Container>
      {renderHead()}

      <Box
        sx={{
          mb: 10,
          display: "flex",
          flexDirection: { xs: "column-reverse", md: "row" },
        }}
      >
        {renderFilters()}

        <Box sx={{ flex: "1 1 auto", minWidth: 0, pl: { md: 8 } }}>{renderListView()}</Box>
      </Box>
    </Container>
  );
}
