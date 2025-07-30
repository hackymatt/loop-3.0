import type { IProjectProps, IProjectStageProp } from "src/types/project";

import { Box } from "@mui/material";

import { ProjectDetailsStepItem } from "./project-details-step-item";

// ----------------------------------------------------------------------

type Props = {
  project: IProjectProps;
  stage: IProjectStageProp;
};

export function ProjectDetailsStepList({ project, stage }: Props) {
  return (
    <div>
      <Box sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
        {stage.steps.map((step) => (
          <ProjectDetailsStepItem key={step.slug} project={project} stage={stage} step={step} />
        ))}
      </Box>
    </div>
  );
}
