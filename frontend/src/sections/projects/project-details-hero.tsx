import type { BoxProps } from "@mui/material/Box";
import type { Language } from "src/locales/types";
import type { IProjectProps } from "src/types/project";

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
import { AvailabilityMark } from "src/components/availability-mark";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";

import { findNextStep } from "./find-next-step";
import { SignUpView } from "../auth/sign-up-view";
import { FormHead } from "../auth/components/form-head";

// ----------------------------------------------------------------------

type Props = BoxProps &
  Pick<
    IProjectProps,
    | "slug"
    | "name"
    | "level"
    | "teachers"
    | "category"
    | "technologies"
    | "totalPoints"
    | "totalHours"
    | "description"
    | "ratingNumber"
    | "totalReviews"
    | "totalStages"
    | "totalStudents"
    | "plans"
    | "stages"
    | "progress"
  > & { language: Language };

export function ProjectDetailsHero({
  sx,
  language,
  slug,
  name,
  level,
  teachers,
  category,
  technologies,
  totalPoints,
  totalHours,
  description,
  ratingNumber,
  totalReviews,
  totalStages,
  totalStudents,
  plans,
  stages,
  progress,
  ...other
}: Props) {
  const { t: navigation } = useTranslation("navigation");
  const { t: locale } = useTranslation("locale");
  const { t } = useTranslation("project");
  const localize = useLocalizedPath();

  const { trackEvent } = useAnalytics();

  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const student = t("student", { returnObjects: true }) as string[];
  const review = t("review", { returnObjects: true }) as string[];
  const hour = t("hour", { returnObjects: true }) as string[];
  const stage = t("stage", { returnObjects: true }) as string[];

  const started = (progress || 0) > 0;
  const completed = (progress || 0) === 100;
  const next = findNextStep(stages);
  const redirect = localize(
    `${paths.learn}/${slug}/${next.stage?.slug || stages[0].slug}/${next.step?.slug || stages[0].steps[0].slug}`
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

      {technologies.map((technology) => (
        <Box key={technology.slug} sx={{ gap: 0.5, display: "flex", alignItems: "center" }}>
          <Iconify icon={getTechnologyIcon(technology.slug)} />
          {technology.name}
        </Box>
      ))}

      <Divider orientation="vertical" sx={{ height: 20, my: "auto" }} />

      {totalReviews ? (
        <>
          <Box sx={{ gap: 0.5, display: "flex", alignItems: "center" }}>
            <Iconify icon="eva:star-fill" sx={{ color: "warning.main" }} />
            {Number.isInteger(ratingNumber) ? `${ratingNumber}.0` : ratingNumber}
          </Box>
          <Divider orientation="vertical" sx={{ height: 20, my: "auto" }} />
          <Box>
            {fShortenNumber(totalReviews, { code: locale("code") })}{" "}
            {languagePluralize(review, totalReviews)}
          </Box>
          <Divider orientation="vertical" sx={{ height: 20, my: "auto" }} />
        </>
      ) : null}

      {totalStudents ? (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {fShortenNumber(totalStudents, { code: locale("code") })}
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
          {`${fShortenNumber(totalHours, { maximumFractionDigits: 0 })}+ ${languagePluralize(hour, totalHours)}`}
        </div>
      ) : null}

      {totalStages ? (
        <div>
          <Iconify icon="solar:documents-minimalistic-outline" />
          {totalStages} {languagePluralize(stage, totalStages)}
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

  const renderAvailabilityMark = () => <AvailabilityMark plans={plans.map((plan) => plan.type)} />;

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
        href={isLoggedIn ? redirect : localize(paths.auth.register)}
        onClick={() => {
          if (!isLoggedIn) {
            user.setField("redirect", redirect);
          }
          trackEvent({ category: "project", label: `project (${slug})`, action: "start" });
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
          language={language}
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
            { name: navigation("projects"), href: localize(paths.projects) },
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
            {renderAvailabilityMark()}
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
