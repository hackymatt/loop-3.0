import type { BoxProps } from "@mui/material/Box";
import type { ICourseListProps } from "src/types/course";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { Iconify } from "src/components/iconify";

import { CourseItem } from "./course-item";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  courses: ICourseListProps[];
};

export function CourseListSimilar({ courses, sx, ...other }: Props) {
  const { t } = useTranslation("course");
  const localize = useLocalizedPath();

  return (
    <Box
      component="section"
      sx={[
        { py: { xs: 10, md: 15 }, bgcolor: "background.neutral" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container>
        <Box sx={{ display: "flex", alignItems: "center", mb: { xs: 5, md: 10 } }}>
          <Typography component="h6" variant="h3" sx={{ flexGrow: 1 }}>
            {t("similar")}
          </Typography>

          <Button
            component={RouterLink}
            href={localize(paths.courses)}
            color="inherit"
            endIcon={<Iconify icon="solar:alt-arrow-right-outline" />}
          >
            {t("viewAll")}
          </Button>
        </Box>

        <Box
          sx={{
            gap: 4,
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          {courses.map((course) => (
            <CourseItem key={course.slug} course={course} isVertical />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
