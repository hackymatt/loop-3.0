import type { BoxProps } from "@mui/material/Box";
import type { ICourseProps } from "src/types/course";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { CourseDetailsChapterList } from "./course-details-chapter-list";

// ----------------------------------------------------------------------

type Props = BoxProps & { course: ICourseProps };

export function CourseDetailsSummary({ course, sx, ...other }: Props) {
  const { t } = useTranslation("course");

  const renderOverview = () => (
    <div>
      <Typography component="h6" variant="h4" sx={{ mb: 2 }}>
        {t("overview")}
      </Typography>

      <Typography>{course.overview}</Typography>
    </div>
  );

  return (
    <Box
      sx={[
        { gap: 5, display: "flex", flexDirection: "column" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {renderOverview()}

      <CourseDetailsChapterList course={course} />
    </Box>
  );
}
