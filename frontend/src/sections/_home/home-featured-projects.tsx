import type { Variants } from "framer-motion";
import type { BoxProps } from "@mui/material/Box";
import type { IProjectListProps } from "src/types/project";

import { m } from "framer-motion";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { Iconify } from "src/components/iconify";
import { varFade, MotionViewport } from "src/components/animate";

import { ProjectItem } from "../projects/project-item";
// ----------------------------------------------------------------------

const variants: Variants = varFade("inUp", { distance: 24 });

type ProjectsProps = {
  projects: IProjectListProps[];
  isHome?: boolean;
} & BoxProps;

export function HomeFeaturedProjects({ projects, isHome, sx, ...other }: ProjectsProps) {
  const { t } = useTranslation("home");
  const localize = useLocalizedPath();

  return (
    <Box
      component="section"
      sx={[{ pt: { xs: 5, md: 10 }, pb: { xs: 10, md: 15 } }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Container component={MotionViewport}>
        <Grid
          container
          spacing={{ xs: 2, md: 4 }}
          sx={{ textAlign: { xs: "center", md: "unset" } }}
        >
          <Grid size={{ xs: 12, md: 4 }}>
            <m.div variants={variants}>
              <Typography variant="overline" sx={{ color: "text.disabled" }}>
                {t("project.header")}
              </Typography>
            </m.div>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <m.div variants={variants}>
              <Typography variant="h3">{t("project.subtitle")}</Typography>
            </m.div>
          </Grid>
        </Grid>

        <m.div variants={variants}>
          <Box
            sx={{
              columnGap: 4,
              display: "grid",
              py: { xs: 5, md: 10 },
              rowGap: { xs: 4, md: 5 },
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
            }}
          >
            {projects.map((project) => (
              <ProjectItem key={project.slug} project={project} isHome />
            ))}
          </Box>
        </m.div>

        <m.div variants={variants}>
          <Box sx={{ textAlign: "center" }}>
            <Button
              component={RouterLink}
              href={localize(paths.projects)}
              color="inherit"
              size="large"
              variant="outlined"
              endIcon={<Iconify icon="solar:alt-arrow-right-outline" />}
            >
              {t("project.button")}
            </Button>
          </Box>
        </m.div>
      </Container>
    </Box>
  );
}
