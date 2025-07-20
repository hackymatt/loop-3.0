import type { IProjectProps, IProjectStepProp, IProjectStageProp } from "src/types/project";

import { Box, Button, Typography } from "@mui/material";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useAnalytics } from "src/app/analytics-provider";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

// ----------------------------------------------------------------------

type StepItemProps = {
  project: IProjectProps;
  stage: IProjectStageProp;
  step: IProjectStepProp;
};

export function ProjectDetailsStepItem({ project, stage, step }: StepItemProps) {
  const { trackEvent } = useAnalytics();
  const localize = useLocalizedPath();

  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const completed = (step.progress || 0) === 100;
  const redirect = localize(`${paths.learn}/${project.slug}/${stage.slug}/${step.slug}`);

  return (
    <Button
      variant="text"
      size="medium"
      color="inherit"
      href={isLoggedIn ? redirect : localize(paths.auth.register)}
      onClick={() => {
        if (!isLoggedIn) {
          user.setField("redirect", redirect);
        }
        trackEvent({ category: "project", label: `step (${step.slug})`, action: "start" });
      }}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        textAlign: "left",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{step.name}</Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {completed && <Iconify icon="carbon:checkmark-filled" sx={{ color: "success.main" }} />}
        <Typography variant="body2">{step.totalPoints} XP</Typography>
      </Box>
    </Button>
  );
}
