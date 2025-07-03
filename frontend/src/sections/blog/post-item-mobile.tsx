import type { BoxProps } from "@mui/material/Box";
import type { IBlogRecentProps } from "src/types/blog";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Typography } from "@mui/material";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { fDate } from "src/utils/format-time";

import { Image } from "src/components/image";

import { PostHeader } from "./post-header";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  post: IBlogRecentProps;
  onSidebar?: boolean;
};

export function PostItemMobile({ post, onSidebar, sx, ...other }: Props) {
  const localize = useLocalizedPath();

  return (
    <Link
      component={RouterLink}
      href={localize(`${paths.post}/${post.slug}`)}
      color="inherit"
      underline="none"
    >
      <Box
        sx={[
          {
            gap: 2,
            width: 1,
            display: "flex",
            alignItems: { xs: "flex-start", md: "unset" },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <Image
          alt={post.name}
          src={post.heroUrl}
          sx={{ width: 64, height: 64, flexShrink: 0, borderRadius: 1.5 }}
        />

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            color="inherit"
            variant={onSidebar ? "subtitle2" : "subtitle1"}
            sx={(theme) => ({
              ...theme.mixins.maxLine({
                line: 2,
                persistent: onSidebar ? theme.typography.subtitle2 : theme.typography.subtitle1,
              }),
              mb: onSidebar ? 0.5 : 1,
            })}
          >
            {post.name}
          </Typography>

          <PostHeader
            publishedAt={fDate(post.publishedAt)}
            duration={post.duration}
            category={post.category}
          />
        </Box>
      </Box>
    </Link>
  );
}
