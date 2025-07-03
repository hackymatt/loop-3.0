"use client";

import type { ICourseListProps } from "src/types/course";

import { useTranslation } from "react-i18next";

import { Box, Button, Typography } from "@mui/material";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { Iconify } from "src/components/iconify";

import { CourseProgressItem } from "../courses/course-progress-item";

// ----------------------------------------------------------------------

type Props = { courses: ICourseListProps[] };

// ----------------------------------------------------------------------

export function CoursesProgress({ courses }: Props) {
  const { t } = useTranslation("dashboard");
  const localize = useLocalizedPath();

  const renderList = () => (
    <Box
      sx={{
        mt: 3,
        gap: 3,
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(1, minmax(0, 1fr))",
          md: "repeat(2, minmax(0, 1fr))",
        },
      }}
    >
      {(courses || []).map((course) => (
        <Box key={course.slug} sx={{ width: "100%" }}>
          <CourseProgressItem course={course} />
        </Box>
      ))}
    </Box>
  );

  const renderInfo = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 5,
        gap: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="body1" sx={{ color: "text.disabled" }}>
        {t("courses.lack")}
      </Typography>

      <Button
        component={RouterLink}
        href={localize(paths.courses)}
        color="inherit"
        size="large"
        variant="text"
        endIcon={<Iconify icon="solar:alt-arrow-right-outline" />}
      >
        {t("courses.start")}
      </Button>
    </Box>
  );

  return (
    <Box
      sx={(theme) => ({
        borderRadius: 2,
        p: 2,
        gridTemplateColumns: "repeat(2, 1fr)",
        border: `dashed 1px ${theme.vars.palette.divider}`,
      })}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: { xs: 2, md: 5 },
          textAlign: { xs: "center", md: "left" },
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5">{t("courses.title")}</Typography>

        <Button
          component={RouterLink}
          href={localize(paths.courses)}
          color="inherit"
          endIcon={<Iconify icon="solar:alt-arrow-right-outline" />}
          sx={{ display: "inline-flex" }}
        >
          {t("courses.button")}
        </Button>
      </Box>

      {courses.length ? renderList() : renderInfo()}
    </Box>
  );
}
