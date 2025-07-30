import type { IProjectProps } from "src/types/project";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { Box, Card } from "@mui/material";
import Typography from "@mui/material/Typography";

import { ProjectDetailsStageItem } from "./project-details-stage-item";

// ----------------------------------------------------------------------

type Props = {
  project: IProjectProps;
};

export function ProjectDetailsStageList({ project }: Props) {
  const { t } = useTranslation("project");

  const [expanded, setExpanded] = useState<string | false>(false);

  const handleExpandedStage = useCallback(
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    },
    []
  );

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t("stages.title")}
      </Typography>

      <Box sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
        {project.stages.map((stage, index) => (
          <Card
            key={stage.slug}
            sx={{ p: 3, gap: 2, borderRadius: 2, display: "flex", flexDirection: "column" }}
          >
            <ProjectDetailsStageItem
              key={stage.slug}
              project={project}
              stage={stage}
              index={index + 1}
              expanded={expanded === stage.slug}
              onExpanded={handleExpandedStage(stage.slug)}
            />
          </Card>
        ))}
      </Box>
    </div>
  );
}
