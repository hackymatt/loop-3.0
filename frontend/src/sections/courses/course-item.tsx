import type { ICourseListProps } from "src/types/course";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Link from "@mui/material/Link";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import { LinearProgress } from "@mui/material";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { usePluralize } from "src/hooks/use-pluralize";
import { useLocalizedPath } from "src/hooks/use-localized-path";

import { getLevelIcon } from "src/utils/level-icon";
import { fShortenNumber } from "src/utils/format-number";
import { getTechnologyIcon } from "src/utils/technology-icon";

import { DEFAULT_AVATAR_URL } from "src/consts/avatar";

import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------

type Props = {
  course: ICourseListProps;
  isVertical?: boolean;
};

export function CourseItem({ course, isVertical }: Props) {
  const { t: locale } = useTranslation("locale");
  const { t } = useTranslation("course");
  const localize = useLocalizedPath();

  const instructor = t("instructor", { returnObjects: true }) as string[];
  const student = t("student", { returnObjects: true }) as string[];
  const review = t("review", { returnObjects: true }) as string[];
  const hour = t("hour", { returnObjects: true }) as string[];
  const lesson = t("lesson", { returnObjects: true }) as string[];

  const languagePluralize = usePluralize();

  const renderTop = () => (
    <Box sx={{ gap: 1, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
      <Typography variant="overline" sx={{ color: "primary.main", flexGrow: 1 }}>
        {course.category.name}
      </Typography>

      {course.progress ? (
        <>
          <LinearProgress
            color="primary"
            variant="determinate"
            value={course.progress}
            sx={{ flex: "1 1 auto" }}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {Math.round(course.progress)}%
          </Typography>
        </>
      ) : null}
    </Box>
  );

  const renderBottom = () => (
    <Box
      sx={{
        gap: 1.5,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        typography: "body2",
        color: "text.disabled",
      }}
    >
      <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
        <Iconify icon="solar:clock-circle-outline" />{" "}
        {`${course.totalHours} ${languagePluralize(hour, course.totalHours)}`}
      </Box>

      <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
        <Iconify icon="solar:documents-minimalistic-outline" />
        {course.totalLessons} {languagePluralize(lesson, course.totalLessons)}
      </Box>
    </Box>
  );

  const renderTexts = () => (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        color="inherit"
        variant="h6"
        sx={(theme) => ({
          ...theme.mixins.maxLine({ line: 1 }),
        })}
      >
        {course.name}
      </Typography>

      <Typography
        variant="body2"
        sx={(theme) => ({
          mt: 1,
          color: "text.secondary",
          ...theme.mixins.maxLine({ line: 2 }),
          ...(isVertical && { display: { sm: "none" } }),
        })}
      >
        {course.description}
      </Typography>
    </Box>
  );

  const renderTeacher = () => (
    <Box sx={{ gap: 1.5, display: "flex", alignItems: "center" }}>
      <Avatar src={course.teachers[0]?.avatarUrl || DEFAULT_AVATAR_URL} />

      <Box sx={{ gap: 0.75, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="body2">{course.teachers[0]?.name}</Typography>

        {Number(course.teachers?.length) - 1 > 0 && (
          <Box component="span" sx={{ typography: "body2", color: "text.secondary" }}>
            + {Number(course.teachers?.length) - 1}{" "}
            {languagePluralize(instructor, Number(course.teachers?.length) - 1)}
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderInfo = () => (
    <Box
      sx={{
        gap: 1.5,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        typography: "body2",
      }}
    >
      <Box sx={{ gap: 0.5, display: "flex", alignItems: "center" }}>
        <Iconify icon={getLevelIcon(course.level.slug)} />
        {course.level.name}
      </Box>

      <Divider orientation="vertical" sx={{ height: 20, my: "auto" }} />

      <Box sx={{ gap: 0.5, display: "flex", alignItems: "center" }}>
        <Iconify icon={getTechnologyIcon(course.technology.slug)} />
        {course.technology.name}
      </Box>

      {course.totalReviews ? (
        <>
          <Divider orientation="vertical" sx={{ height: 20, my: "auto" }} />
          <Box sx={{ gap: 0.5, display: "flex", alignItems: "center" }}>
            <Iconify icon="eva:star-fill" sx={{ color: "warning.main" }} />
            {Number.isInteger(course.ratingNumber)
              ? `${course.ratingNumber}.0`
              : course.ratingNumber}
          </Box>
          <Divider orientation="vertical" sx={{ height: 20, my: "auto" }} />
          <Box>
            {fShortenNumber(course.totalReviews, {
              code: locale("code"),
              currency: locale("currency"),
            })}{" "}
            {languagePluralize(review, course.totalReviews)}
          </Box>
        </>
      ) : null}

      {course.totalStudents ? (
        <>
          <Divider orientation="vertical" sx={{ height: 20, my: "auto" }} />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {fShortenNumber(course.totalStudents, {
              code: locale("code"),
              currency: locale("currency"),
            })}
            <Box component="span" sx={{ ml: 0.5 }}>
              {languagePluralize(student, course.totalStudents)}
            </Box>
          </Box>
        </>
      ) : null}
    </Box>
  );

  const renderContent = () => (
    <Box
      sx={{
        p: 3,
        gap: 3,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, sm: isVertical ? 3 : 1 },
        }}
      >
        {renderTop()}
        {renderTexts()}
      </Box>

      {renderInfo()}
      {renderTeacher()}

      <Divider
        sx={{
          borderStyle: "dashed",
          display: { sm: "none" },
          ...(isVertical && { display: "block" }),
        }}
      />
      {renderBottom()}
    </Box>
  );

  return (
    <Link
      component={RouterLink}
      href={localize(`${paths.course}/${course.slug}`)}
      color="inherit"
      underline="none"
    >
      <Card
        sx={(theme) => ({
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          "&:hover": { boxShadow: theme.vars.customShadows.z24 },
          ...(isVertical && { flexDirection: "column" }),
        })}
      >
        {renderContent()}
      </Card>
    </Link>
  );
}
