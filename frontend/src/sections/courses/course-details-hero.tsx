import type { BoxProps } from "@mui/material/Box";
import type { ICourseProps } from "src/types/course";

import { useTranslation } from "react-i18next";
import { varAlpha } from "minimal-shared/utils";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { Button } from "@mui/material";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";

import { usePluralize } from "src/hooks/use-pluralize";
import { useLocalizedPath } from "src/hooks/use-localized-path";

import { getLevelIcon } from "src/utils/level-icon";
import { fShortenNumber } from "src/utils/format-number";
import { getTechnologyIcon } from "src/utils/technology-icon";

import { useAnalytics } from "src/app/analytics-provider";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";
import { AnimateBorder } from "src/components/animate";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";

import { SignUpView } from "../auth/sign-up-view";
import { findNextLesson } from "./find-next-lesson";
import { FormHead } from "../auth/components/form-head";

// ----------------------------------------------------------------------

type Props = BoxProps &
  Pick<
    ICourseProps,
    | "slug"
    | "name"
    | "level"
    | "teachers"
    | "category"
    | "technology"
    | "totalPoints"
    | "totalHours"
    | "description"
    | "ratingNumber"
    | "totalReviews"
    | "totalQuizzes"
    | "totalExercises"
    | "totalVideos"
    | "totalLessons"
    | "totalStudents"
    | "chapters"
    | "progress"
  >;

export function CourseDetailsHero({
  sx,
  slug,
  name,
  level,
  teachers,
  category,
  technology,
  totalPoints,
  totalHours,
  description,
  ratingNumber,
  totalReviews,
  totalQuizzes,
  totalExercises,
  totalVideos,
  totalLessons,
  totalStudents,
  chapters,
  progress,
  ...other
}: Props) {
  const { t: navigation } = useTranslation("navigation");
  const { t: locale } = useTranslation("locale");
  const { t } = useTranslation("course");
  const localize = useLocalizedPath();

  const { trackEvent } = useAnalytics();

  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const student = t("student", { returnObjects: true }) as string[];
  const review = t("review", { returnObjects: true }) as string[];
  const hour = t("hour", { returnObjects: true }) as string[];
  const lesson = t("lesson", { returnObjects: true }) as string[];
  const video = t("video", { returnObjects: true }) as string[];
  const exercise = t("exercise", { returnObjects: true }) as string[];
  const quiz = t("quiz", { returnObjects: true }) as string[];

  const started = (progress || 0) > 0;
  const completed = (progress || 0) === 100;
  const next = findNextLesson(chapters);
  const redirect = localize(
    `${paths.learn}/${slug}/${next.chapter?.slug || chapters[0].slug}/${next.lesson?.slug || chapters[0].lessons[0].slug}`
  );

  const languagePluralize = usePluralize();

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
        <Iconify icon={getLevelIcon(level.slug)} />
        {level?.name}
      </Box>

      <Divider orientation="vertical" sx={{ height: 20, my: "auto" }} />

      <Box sx={{ gap: 0.5, display: "flex", alignItems: "center" }}>
        <Iconify icon={getTechnologyIcon(technology.slug)} />
        {technology?.name}
      </Box>

      <Divider orientation="vertical" sx={{ height: 20, my: "auto" }} />

      {totalReviews ? (
        <>
          <Box sx={{ gap: 0.5, display: "flex", alignItems: "center" }}>
            <Iconify icon="eva:star-fill" sx={{ color: "warning.main" }} />
            {Number.isInteger(ratingNumber) ? `${ratingNumber}.0` : ratingNumber}
          </Box>
          <Divider orientation="vertical" sx={{ height: 20, my: "auto" }} />
          <Box>
            {fShortenNumber(totalReviews, { code: locale("code"), currency: locale("currency") })}{" "}
            {languagePluralize(review, totalReviews)}
          </Box>
          <Divider orientation="vertical" sx={{ height: 20, my: "auto" }} />
        </>
      ) : null}

      {totalStudents ? (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {fShortenNumber(totalStudents, { code: locale("code"), currency: locale("currency") })}
          <Box component="span" sx={{ ml: 0.5 }}>
            {languagePluralize(student, totalStudents)}
          </Box>
        </Box>
      ) : null}
    </Box>
  );

  const renderTexts = () => (
    <Box sx={{ gap: 2, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <Typography variant="overline" sx={{ color: "secondary.main" }}>
        {category?.name}
      </Typography>

      <Typography variant="h3" component="h1">
        {name}
      </Typography>

      {renderInfo()}

      <Typography sx={{ color: "text.secondary" }}>{description}</Typography>
    </Box>
  );

  const renderContent = () => (
    <Box
      sx={{
        rowGap: 2,
        columnGap: 3,
        display: "flex",
        flexWrap: "wrap",
        maxWidth: 560,
        typography: "body2",
        "& > div": { gap: 1, display: "flex", alignItems: "center" },
      }}
    >
      {totalHours ? (
        <div>
          <Iconify icon="solar:clock-circle-outline" />{" "}
          {`${totalHours} ${languagePluralize(hour, totalHours)}`}
        </div>
      ) : null}

      {totalLessons ? (
        <div>
          <Iconify icon="solar:documents-minimalistic-outline" />
          {totalLessons} {languagePluralize(lesson, totalLessons)}
        </div>
      ) : null}

      {totalVideos ? (
        <div>
          <Iconify icon="solar:video-frame-outline" />
          {`${totalVideos} ${languagePluralize(video, totalVideos)}`}
        </div>
      ) : null}

      {totalExercises ? (
        <div>
          <Iconify icon="solar:code-outline" />
          {`${totalExercises} ${languagePluralize(exercise, totalExercises)}`}
        </div>
      ) : null}

      {totalQuizzes ? (
        <div>
          <Iconify icon="solar:question-circle-outline" />
          {`${totalQuizzes} ${languagePluralize(quiz, totalQuizzes)}`}
        </div>
      ) : null}
    </Box>
  );

  const renderSummary = () => (
    <Box
      sx={{
        rowGap: 2,
        columnGap: 3,
        display: "flex",
        flexWrap: "wrap",
        maxWidth: 560,
        typography: "body2",
        "& > div": { gap: 1, display: "flex", alignItems: "center" },
      }}
    >
      {totalPoints ? (
        <div>
          <Iconify icon="solar:medal-star-outline" /> {`${totalPoints} XP`}
        </div>
      ) : null}

      <Box sx={{ gap: 1, display: "flex", alignItems: "center", typography: "body2" }}>
        <Iconify icon="carbon:data-accessor" />
        {t("access")}
      </Box>

      <Box sx={{ gap: 1, display: "flex", alignItems: "center", typography: "body2" }}>
        <Iconify icon="carbon:certificate" />
        {t("certificate.title")}
      </Box>
    </Box>
  );

  const renderButton = () => (
    <AnimateBorder
      sx={(theme) => ({
        borderRadius: 1,
        position: "relative",
        bgcolor: theme.vars.palette.primary.main,
        color: "common.white",
      })}
      duration={6}
      slotProps={{
        outlineColor: (theme) =>
          `linear-gradient(135deg, ${varAlpha(theme.vars.palette.secondary.lightChannel, 0.08)} 50%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.24)})`,
        primaryBorder: {
          size: 60,
          sx: (theme) => ({
            color: theme.vars.palette.secondary.main,
          }),
        },
        secondaryBorder: {
          sx: (theme) => ({
            color: theme.vars.palette.error.main,
          }),
        },
      }}
    >
      <Button
        variant="text"
        size="large"
        href={isLoggedIn ? redirect : localize(paths.register)}
        onClick={() => {
          if (!isLoggedIn) {
            user.setField("redirect", redirect);
          }
          trackEvent({ category: "course", label: `course (${slug})`, action: "start" });
        }}
        sx={{ px: 2, borderRadius: "inherit", textAlign: "center" }}
      >
        {isLoggedIn && started ? t("continue") : t("start")}
      </Button>
    </AnimateBorder>
  );

  const renderForm = () => (
    <Box
      sx={(theme) => ({
        py: 5,
        width: 1,
        zIndex: 2,
        borderRadius: 2,
        flexDirection: "column",
        px: { xs: 3, md: 5 },
        boxShadow: theme.vars.customShadows.z24,
        maxWidth: "var(--layout-auth-content-width)",
        bgcolor: theme.vars.palette.background.default,
        flex: "1 1 auto",
        display: "block",
      })}
    >
      <div>
        <SignUpView
          header={<FormHead title={t("sign-up.header")} />}
          buttonText={t("sign-up.button")}
        />
      </div>
    </Box>
  );

  return (
    <Box
      component="section"
      sx={[{ pt: 5, pb: 10, bgcolor: "background.neutral" }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Container sx={{ overflow: "hidden" }}>
        <CustomBreadcrumbs
          links={[
            { name: navigation("home"), href: localize(paths.home) },
            { name: navigation("courses"), href: localize(paths.courses) },
            { name },
          ]}
          sx={{ mb: { xs: 5, md: 10 } }}
        />

        <Grid
          container
          spacing={{ xs: 5, md: 10 }}
          direction={{ xs: "column", md: "row" }}
          alignItems="center"
        >
          <Grid size={{ xs: 12, md: 7 }} sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
            {renderTexts()}
            {!completed && renderButton()}
            {renderContent()}
            {renderSummary()}
          </Grid>

          {!isLoggedIn ? (
            <Grid
              size={{ xs: 12, md: 5 }}
              sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              {renderForm()}
            </Grid>
          ) : null}
        </Grid>
      </Container>
    </Box>
  );
}
