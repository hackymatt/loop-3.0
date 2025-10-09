import type { IProjectListProps } from "src/types/project";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import { LinearProgress } from "@mui/material";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { getLevelIcon } from "src/utils/level-icon";
import { getTechnologyIcon } from "src/utils/technology-icon";

import { Iconify, isIconExists } from "src/components/iconify";

// ----------------------------------------------------------------------

type Props = {
  project: IProjectListProps;
};

export function ProjectProgressItem({ project }: Props) {
  const localize = useLocalizedPath();

  const renderTop = () => (
    <Box sx={{ gap: 1, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
      <Typography variant="overline" sx={{ color: "primary.main", flexGrow: 1 }}>
        {project.category.name}
      </Typography>

      {project.progress ? (
        <>
          <LinearProgress
            color="primary"
            variant="determinate"
            value={project.progress}
            sx={{ flex: "1 1 auto" }}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {Math.round(project.progress)}%
          </Typography>
        </>
      ) : null}
    </Box>
  );

  const renderTexts = () => (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        color="inherit"
        variant="h6"
        sx={(theme) => ({
          ...theme.mixins.maxLine({ line: 1 }),
        })}
      >
        {project.name}
      </Typography>

      <Typography
        variant="body2"
        sx={(theme) => ({
          mt: 1,
          color: "text.secondary",
          ...theme.mixins.maxLine({ line: 2 }),
        })}
      >
        {project.description}
      </Typography>
    </Box>
  );

  const renderInfo = () => (
    <Box
      sx={{
        gap: 1.5,
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "center",
        typography: "body2",
        minWidth: 0,
      }}
    >
      <Iconify icon={getLevelIcon(project.level.slug)} />

      <Divider orientation="vertical" sx={{ height: 20, my: "auto" }} />

      {project.technologies.map(
        (technology) =>
          getTechnologyIcon(technology.slug) !== "carbon:code" && (
            <Iconify key={technology.slug} icon={getTechnologyIcon(technology.slug)} />
          )
      )}
    </Box>
  );

  const renderContent = () => (
    <Box
      sx={{
        p: 3,
        gap: 3,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, sm: 1 },
        }}
      >
        {renderTop()}
        {renderTexts()}
      </Box>

      {renderInfo()}
    </Box>
  );

  return (
    <Link
      component={RouterLink}
      href={localize(`${paths.project}/${project.slug}`)}
      color="inherit"
      underline="none"
    >
      <Card
        sx={(theme) => ({
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          "&:hover": { boxShadow: theme.vars.customShadows.z24 },
        })}
      >
        {renderContent()}
      </Card>
    </Link>
  );
}
