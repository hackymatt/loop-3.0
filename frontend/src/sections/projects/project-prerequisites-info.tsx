import type { CardProps } from "@mui/material";
import type { IPrerequisite } from "src/types/project";

import { useTranslation } from "react-i18next";

import { Box, Card, Link } from "@mui/material";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------

type Props = CardProps & {
  prerequisites: IPrerequisite[];
};

export function ProjectDetailsPrerequisites({ prerequisites, sx, ...other }: Props) {
  const { t } = useTranslation("project");

  const renderList = () =>
    prerequisites.map((prerequisite) =>
      prerequisite.type === "project" ? (
        <ProjectItem key={prerequisite.slug} project={prerequisite} />
      ) : (
        <BlogItem key={prerequisite.slug} post={prerequisite} />
      )
    );

  const renderInfo = () => (
    <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
      <Iconify icon="carbon:checkmark-filled" sx={{ color: "success.main" }} />
      <Typography variant="subtitle2">{t("prerequisites.none")}</Typography>
    </Box>
  );

  return (
    <Card
      sx={[
        { p: 3, gap: 2, borderRadius: 2, display: "flex", flexDirection: "column" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography component="h6" variant="h6">
        {t("prerequisites.title")} ({prerequisites.length})
      </Typography>
      {prerequisites.length ? renderList() : renderInfo()}
    </Card>
  );
}

// ----------------------------------------------------------------------

type ProjectItemProps = {
  project: IPrerequisite;
};

function ProjectItem({ project }: ProjectItemProps) {
  const localize = useLocalizedPath();

  return (
    <Link
      component={RouterLink}
      href={localize(`${paths.project}/${project.slug}`)}
      underline="hover"
      color="inherit"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Iconify icon="solar:code-2-linear" width={18} />
      <Typography
        variant="subtitle2"
        sx={(theme) => ({
          ...theme.mixins.maxLine({ line: 1 }),
        })}
      >
        {project.name}
      </Typography>
    </Link>
  );
}

// ----------------------------------------------------------------------

type BlogItemProps = {
  post: IPrerequisite;
};

function BlogItem({ post }: BlogItemProps) {
  const localize = useLocalizedPath();

  return (
    <Link
      component={RouterLink}
      href={localize(`${paths.post}/${post.slug}`)}
      underline="hover"
      color="inherit"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Iconify icon="solar:notebook-minimalistic-outline" width={18} />
      <Typography
        variant="subtitle2"
        sx={(theme) => ({
          ...theme.mixins.maxLine({ line: 1 }),
        })}
      >
        {post.name}
      </Typography>
    </Link>
  );
}
