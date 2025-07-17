import type { IProjectProps, IProjectStepProp } from "src/types/project";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { Link, Badge, Stack, Button, Divider, LinearProgress } from "@mui/material";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useAnalytics } from "src/app/analytics-provider";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

import { findNextSubstep } from "./find-next-substep";
import { ProjectDetailsSubstepList } from "./project-details-substep-list";

// ----------------------------------------------------------------------

type StepItemProps = {
  project: IProjectProps;
  step: IProjectStepProp;
  index: number;
  expanded: boolean;
  onExpanded: (event: React.SyntheticEvent, isExpanded: boolean) => void;
};

export function ProjectDetailsStepItem({
  project,
  step,
  index,
  expanded,
  onExpanded,
}: StepItemProps) {
  const { t } = useTranslation("project");
  const localize = useLocalizedPath();

  const { trackEvent } = useAnalytics();

  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const started = (step.progress || 0) > 0;
  const completed = (step.progress || 0) === 100;
  const next = findNextSubstep([step]);
  const redirect = localize(
    `${paths.learn}/${project.slug}/${step.slug}/${next.substep?.slug || step.substeps[0].slug}`
  );

  const renderButton = () => (
    <Button
      variant="contained"
      size="medium"
      color="primary"
      href={isLoggedIn ? redirect : localize(paths.auth.register)}
      onClick={() => {
        if (!isLoggedIn) {
          user.setField("redirect", redirect);
        }
        trackEvent({ category: "step", label: `step (${step.slug})`, action: "start" });
      }}
      sx={{ px: 2, textAlign: "center" }}
    >
      {isLoggedIn && started ? t("steps.continue") : t("steps.start")}
    </Button>
  );

  const renderExpand = () => (
    <Link
      variant="subtitle2"
      color="inherit"
      sx={{
        gap: 1,
        display: "flex",
        cursor: "pointer",
        alignItems: "center",
        whiteSpace: "nowrap",
        minWidth: "max-content",
      }}
    >
      {expanded ? t("steps.hide") : t("steps.show")} {t("steps.substep")}
      <Iconify icon={expanded ? "solar:alt-arrow-up-outline" : "solar:alt-arrow-down-outline"} />
    </Link>
  );

  const renderSummary = () => (
    <AccordionSummary>
      <Stack spacing={2} flexGrow={1} divider={<Divider component="span" />}>
        <Box sx={{ display: "flex", alignItems: "center", width: 1 }}>
          <Badge color="primary" badgeContent={index} sx={{ ml: 1 }} />

          <Typography variant="subtitle1" sx={{ flexGrow: 1, ml: 2 }}>
            {step.name}
          </Typography>

          {step.progress ? (
            <>
              <LinearProgress
                color="primary"
                variant="determinate"
                value={step.progress}
                sx={{ flex: "1 1 auto", mr: 1 }}
              />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {Math.round(step.progress)}%
              </Typography>
            </>
          ) : null}

          <Box sx={{ flexGrow: 1 }} />

          {!completed && renderButton()}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", width: 1, gap: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", flexGrow: 1 }}>
            {step.description}
          </Typography>

          {renderExpand()}
        </Box>
      </Stack>
    </AccordionSummary>
  );

  const renderDetails = () => (
    <AccordionDetails sx={{ typography: "body2" }}>
      <ProjectDetailsSubstepList project={project} step={step} />
    </AccordionDetails>
  );

  return (
    <Accordion
      expanded={expanded}
      onChange={onExpanded}
      sx={{ borderBottom: "1px solid transparent" }} // Makes divider invisible but keeps spacing
    >
      {renderSummary()}
      {renderDetails()}
    </Accordion>
  );
}
