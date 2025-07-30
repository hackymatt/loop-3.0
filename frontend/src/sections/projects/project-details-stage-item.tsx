import type { IProjectProps, IProjectStageProp } from "src/types/project";

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

import { findNextStep } from "./find-next-step";
import { ProjectDetailsStepList } from "./project-details-step-list";

// ----------------------------------------------------------------------

type StepItemProps = {
  project: IProjectProps;
  stage: IProjectStageProp;
  index: number;
  expanded: boolean;
  onExpanded: (event: React.SyntheticEvent, isExpanded: boolean) => void;
};

export function ProjectDetailsStageItem({
  project,
  stage,
  index,
  expanded,
  onExpanded,
}: StepItemProps) {
  const { t } = useTranslation("project");
  const localize = useLocalizedPath();

  const { trackEvent } = useAnalytics();

  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const started = (stage.progress || 0) > 0;
  const completed = (stage.progress || 0) === 100;
  const next = findNextStep([stage]);
  const redirect = localize(
    `${paths.learn}/${project.slug}/${stage.slug}/${next.step?.slug || stage.steps[0].slug}`
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
        trackEvent({ category: "stage", label: `stage (${stage.slug})`, action: "start" });
      }}
      sx={{ px: 2, textAlign: "center" }}
    >
      {isLoggedIn && started ? t("stages.continue") : t("stages.start")}
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
      {expanded ? t("stages.hide") : t("stages.show")} {t("stages.step")}
      <Iconify icon={expanded ? "solar:alt-arrow-up-outline" : "solar:alt-arrow-down-outline"} />
    </Link>
  );

  const renderSummary = () => (
    <AccordionSummary>
      <Stack spacing={2} flexGrow={1} divider={<Divider component="span" />}>
        <Box sx={{ display: "flex", alignItems: "center", width: 1 }}>
          <Badge color="primary" badgeContent={index} sx={{ ml: 1 }} />

          <Typography variant="subtitle1" sx={{ flexGrow: 1, ml: 2 }}>
            {stage.name}
          </Typography>

          {stage.progress ? (
            <>
              <LinearProgress
                color="primary"
                variant="determinate"
                value={stage.progress}
                sx={{ flex: "1 1 auto", mr: 1 }}
              />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {Math.round(stage.progress)}%
              </Typography>
            </>
          ) : null}

          {!completed && (
            <>
              <Box sx={{ flexGrow: 1 }} />
              {renderButton()}
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", width: 1, gap: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", flexGrow: 1 }}>
            {stage.description}
          </Typography>

          {renderExpand()}
        </Box>
      </Stack>
    </AccordionSummary>
  );

  const renderDetails = () => (
    <AccordionDetails sx={{ typography: "body2" }}>
      <ProjectDetailsStepList project={project} stage={stage} />
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
