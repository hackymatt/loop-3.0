import type { IProjectProps, IProjectStepProp } from "src/types/project";

import { Box } from "@mui/material";

import { ProjectDetailsSubstepItem } from "./project-details-substep-item";

// ----------------------------------------------------------------------

type Props = {
  project: IProjectProps;
  step: IProjectStepProp;
};

export function ProjectDetailsSubstepList({ project, step }: Props) {
  return (
    <div>
      <Box sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
        {step.substeps.map((substep) => (
          <ProjectDetailsSubstepItem
            key={substep.slug}
            project={project}
            step={step}
            substep={substep}
          />
        ))}
      </Box>
    </div>
  );
}
