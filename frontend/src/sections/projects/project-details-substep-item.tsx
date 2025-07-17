import type { IProjectProps, IProjectSubstepProp, IProjectStepProp } from "src/types/project";

import { Box, Button, Typography } from "@mui/material";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { getSubstepTypeIcon } from "src/utils/substep-type-icon";

import { useAnalytics } from "src/app/analytics-provider";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

// ----------------------------------------------------------------------

type SubstepItemProps = {
  project: IProjectProps;
  step: IProjectStepProp;
  substep: IProjectSubstepProp;
};

export function ProjectDetailsSubstepItem({ project, step, substep }: SubstepItemProps) {
  const { trackEvent } = useAnalytics();
  const localize = useLocalizedPath();

  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const completed = (substep.progress || 0) === 100;
  const redirect = localize(`${paths.learn}/${project.slug}/${step.slug}/${substep.slug}`);

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
        trackEvent({ category: "project", label: `substep (${substep.slug})`, action: "start" });
      }}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        textAlign: "left",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Iconify icon={getSubstepTypeIcon(substep.type, completed)} />
        {substep.name}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {completed && <Iconify icon="carbon:checkmark-filled" sx={{ color: "success.main" }} />}
        <Typography variant="body2">
          {completed ? substep.earnedPoints : substep.totalPoints} XP
        </Typography>
      </Box>
    </Button>
  );
}
