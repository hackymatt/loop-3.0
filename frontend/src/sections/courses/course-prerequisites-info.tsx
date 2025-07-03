import type { CardProps } from "@mui/material";
import type { ICoursePrerequisite } from "src/types/course";

import { useTranslation } from "react-i18next";

import { Box, Card, Link } from "@mui/material";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------

type Props = CardProps & {
  courses: ICoursePrerequisite[];
};

export function CourseDetailsPrerequisites({ courses, sx, ...other }: Props) {
  const { t } = useTranslation("course");

  const renderList = () =>
    courses.map((course) => <CourseItem key={course.slug} course={course} />);

  const renderInfo = () => (
    <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
      <Iconify icon="carbon:checkmark-filled" sx={{ color: "success.main" }} />
      <Typography variant="subtitle2">{t("prerequisites.none")}</Typography>
    </Box>
  );

  return (
    <Card
      sx={[
        { p: 3, gap: 2, borderRadius: 2, display: "flex", flexDirection: "column" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography component="h6" variant="h6">
        {t("prerequisites.title")} ({courses.length})
      </Typography>
      {courses.length ? renderList() : renderInfo()}
    </Card>
  );
}

// ----------------------------------------------------------------------

type CourseItemProps = {
  course: ICoursePrerequisite;
};

function CourseItem({ course }: CourseItemProps) {
  const localize = useLocalizedPath();

  return (
    <Link
      component={RouterLink}
      href={localize(`${paths.course}/${course.slug}`)}
      underline="hover"
      color="inherit"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Iconify icon="solar:square-academic-cap-outline" width={18} />
      <Typography
        variant="subtitle2"
        sx={(theme) => ({
          ...theme.mixins.maxLine({ line: 1 }),
        })}
      >
        {course.name}
      </Typography>
    </Link>
  );
}
