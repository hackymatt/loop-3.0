"use client";

import type {
  IProjectTagProp,
  IProjectLevelProp,
  IProjectListProps,
  IProjectStatusProp,
  IProjectDurationProp,
  IProjectCategoryProp,
  IProjectTechnologyProp,
} from "src/types/project";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { useQueryParams } from "src/hooks/use-query-params";

import { Iconify } from "src/components/iconify";

import { ProjectList } from "../projects/project-list";
import { ProjectsFilters } from "../projects/projects-filters";

// ----------------------------------------------------------------------

const RATING_OPTIONS = ["4", "3", "2"];

// ----------------------------------------------------------------------

type ProjectsViewProps = {
  data: {
    projectLevels: IProjectLevelProp[];
    projectTechnologies: IProjectTechnologyProp[];
    projectCategories: IProjectCategoryProp[];
    projectTags: IProjectTagProp[];
    projects: IProjectListProps[];
    projectsCount: number;
    projectsPageSize: number;
  };
};

export function ProjectsView({ data }: ProjectsViewProps) {
  const { t } = useTranslation("project");

  const statusOptions = t("filter.status.options", { returnObjects: true }) as IProjectStatusProp[];
  const durationOptions = t("filter.duration.options", {
    returnObjects: true,
  }) as IProjectDurationProp[];

  const { handleChange, query } = useQueryParams();

  const {
    projectLevels,
    projectTechnologies,
    projectCategories,
    projectTags,
    projects,
    projectsCount,
    projectsPageSize,
  } = data;

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
      <ProjectList
        projects={projects ?? []}
        recordsCount={projectsCount || 0}
        pagesCount={projectsPageSize || 0}
        page={Number(query.page) || 1}
        onPageChange={(selectedPage: number) => handleChange("page", String(selectedPage))}
      />
    </Box>
  );

  const renderFilters = () => (
    <Box sx={{ flexShrink: 0, width: { md: 280 } }}>
      <ProjectsFilters
        open={openMobile.value}
        onClose={openMobile.onFalse}
        options={{
          levels: projectLevels ?? [],
          technologies: projectTechnologies ?? [],
          categories: projectCategories ?? [],
          durations: durationOptions,
          ratings: RATING_OPTIONS,
          statuses: statusOptions,
          tags: projectTags ?? [],
        }}
      />
    </Box>
  );

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
