import type { BoxProps } from "@mui/material/Box";
import type { IProjectProps } from "src/types/project";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { ProjectDetailsStepList } from "./project-details-step-list";

// ----------------------------------------------------------------------

type Props = BoxProps & { project: IProjectProps };

export function ProjectDetailsSummary({ project, sx, ...other }: Props) {
  const { t } = useTranslation("project");

  const renderOverview = () => (
    <div>
      <Typography component="h6" variant="h4" sx={{ mb: 2 }}>
        {t("overview")}
      </Typography>

      <Typography>{project.overview}</Typography>
    </div>
  );

  return (
    <Box
      sx={[
        { gap: 5, display: "flex", flexDirection: "column" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {renderOverview()}

      <ProjectDetailsStepList project={project} />
    </Box>
  );
}
