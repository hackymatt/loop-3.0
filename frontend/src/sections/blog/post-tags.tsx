import type { BoxProps } from "@mui/material/Box";
import type { IBlogTagProp } from "src/types/blog";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

// ----------------------------------------------------------------------

type PostTagsProps = BoxProps & {
  tags: IBlogTagProp[];
};

export function PostTags({ tags, sx, ...other }: PostTagsProps) {
  const { t } = useTranslation("blog");
  const localize = useLocalizedPath();

  return (
    <Box
      sx={[
        { mt: 5, display: "flex", flexWrap: "wrap", alignItems: "center" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography variant="subtitle2" sx={{ mr: 1 }}>
        {t("tags")}:
      </Typography>
      <Box sx={{ gap: 1, display: "flex", flexWrap: "wrap" }}>
        {tags.map((tag) => (
          <Chip
            key={tag.slug}
            label={tag.name}
            variant="outlined"
            size="small"
            component="a"
            href={localize(`${paths.posts}?tags=${tag.slug}`)}
            clickable
          />
        ))}
      </Box>
    </Box>
  );
}
