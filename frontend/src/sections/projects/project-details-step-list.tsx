import type { IProjectProps } from "src/types/project";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { Box, Card } from "@mui/material";
import Typography from "@mui/material/Typography";

import { ProjectDetailsStepItem } from "./project-details-step-item";

// ----------------------------------------------------------------------

type Props = {
  project: IProjectProps;
};

export function ProjectDetailsStepList({ project }: Props) {
  const { t } = useTranslation("project");

  const [expanded, setExpanded] = useState<string | false>(false);

  const handleExpandedStep = useCallback(
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    },
    []
  );

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t("steps.title")}
      </Typography>

      <Box sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
        {project.steps.map((step, index) => (
          <Card
            key={step.slug}
            sx={{ p: 3, gap: 2, borderRadius: 2, display: "flex", flexDirection: "column" }}
          >
            <ProjectDetailsStepItem
              key={step.slug}
              project={project}
              step={step}
              index={index + 1}
              expanded={expanded === step.slug}
              onExpanded={handleExpandedStep(step.slug)}
            />
          </Card>
        ))}
      </Box>
    </div>
  );
}
