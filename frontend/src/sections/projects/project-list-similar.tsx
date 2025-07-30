import type { BoxProps } from "@mui/material/Box";
import type { IProjectListProps } from "src/types/project";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { Iconify } from "src/components/iconify";

import { ProjectItem } from "./project-item";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  projects: IProjectListProps[];
};

export function ProjectListSimilar({ projects, sx, ...other }: Props) {
  const { t } = useTranslation("project");
  const localize = useLocalizedPath();

  return (
    <Box
      component="section"
      sx={[
        { py: { xs: 10, md: 15 }, bgcolor: "background.neutral" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container>
        <Box sx={{ display: "flex", alignItems: "center", mb: { xs: 5, md: 10 } }}>
          <Typography component="h6" variant="h3" sx={{ flexGrow: 1 }}>
            {t("similar")}
          </Typography>

          <Button
            component={RouterLink}
            href={localize(paths.projects)}
            color="inherit"
            endIcon={<Iconify icon="solar:alt-arrow-right-outline" />}
          >
            {t("viewAll")}
          </Button>
        </Box>

        <Box
          sx={{
            gap: 4,
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          {projects.map((project) => (
            <ProjectItem key={project.slug} project={project} isVertical />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
