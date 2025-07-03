import type { BoxProps } from "@mui/material/Box";
import type { IBlogFeaturedPost } from "src/types/blog";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { fDate } from "src/utils/format-time";

import { DEFAULT_AVATAR_URL } from "src/consts/avatar";

import { Image } from "src/components/image";

import { PostHeader } from "../blog/post-header";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  post: IBlogFeaturedPost;
};

export function FeaturedPost({ post, sx, ...other }: Props) {
  const localize = useLocalizedPath();

  return (
    <Link
      component={RouterLink}
      href={localize(`${paths.post}/${post.slug}`)}
      color="inherit"
      underline="none"
    >
      <Box
        component="section"
        sx={[{ py: 10, bgcolor: "background.neutral" }, ...(Array.isArray(sx) ? sx : [sx])]}
        {...other}
      >
        <Container>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
            <Image
              src={post.heroUrl}
              alt={post.name}
              sx={{ flexGrow: 1, height: 560, borderRadius: 2 }}
            />

            <Stack
              spacing={1}
              sx={{ mx: "auto", pl: { md: 8 }, py: { xs: 3, md: 5 }, maxWidth: { md: 408 } }}
            >
              <PostHeader
                publishedAt={fDate(post.publishedAt)}
                duration={post.duration}
                category={post.category}
              />

              <Typography color="inherit" variant="h3">
                {post.name}
              </Typography>

              <Typography sx={{ color: "text.secondary", flexGrow: 1 }}>
                {post.description}
              </Typography>

              <Box
                sx={{
                  gap: 1.5,
                  display: "flex",
                  alignItems: "center",
                  pt: 1.5,
                  typography: "body2",
                }}
              >
                <Avatar src={post.author.avatarUrl || DEFAULT_AVATAR_URL} />
                {post.author.name}
              </Box>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Link>
  );
}
