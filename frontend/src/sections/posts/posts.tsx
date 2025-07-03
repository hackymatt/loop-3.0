import type { BoxProps } from "@mui/material/Box";
import type { IBlogListProps } from "src/types/blog";
import type { PaperProps } from "@mui/material/Paper";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Pagination, { paginationClasses } from "@mui/material/Pagination";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { fDate } from "src/utils/format-time";

import { DEFAULT_AVATAR_URL } from "src/consts/avatar";

import { Image } from "src/components/image";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  posts: IBlogListProps[];
  recordsCount: number;
  pagesCount: number;
  page: number;
  onPageChange: (selectedPage: number) => void;
};

export function Posts({
  posts,
  recordsCount,
  pagesCount,
  page,
  onPageChange,
  sx,
  ...other
}: Props) {
  return (
    <>
      <Box
        sx={[
          {
            display: "grid",
            columnGap: 4,
            rowGap: { xs: 4, md: 5 },
            gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {posts.map((post) => (
          <PostItem key={post.slug} post={post} />
        ))}
      </Box>

      {recordsCount ? (
        <Pagination
          count={pagesCount}
          page={page}
          onChange={(event, selectedPage: number) => onPageChange(selectedPage)}
          sx={{ py: 10, [`& .${paginationClasses.ul}`]: { justifyContent: "center" } }}
        />
      ) : null}
    </>
  );
}

// ----------------------------------------------------------------------

type PostItemProps = PaperProps & {
  post: IBlogListProps;
};

export function PostItem({ post, sx, ...other }: PostItemProps) {
  const localize = useLocalizedPath();
  return (
    <Link
      component={RouterLink}
      href={localize(`${paths.post}/${post.slug}`)}
      color="inherit"
      underline="none"
    >
      <Paper
        variant="outlined"
        sx={[
          { borderRadius: 2, overflow: "hidden", bgcolor: "transparent" },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <Image src={post.heroUrl} alt={post.name} ratio="1/1" />
        <Box sx={{ display: "flex", gap: 3, p: 3 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2" component="span">
              {fDate(post.publishedAt, "MMM")}
            </Typography>
            <Divider sx={{ mt: 1, mb: 0.5 }} />
            <Typography variant="h3" component="span">
              {fDate(post.publishedAt, "DD")}
            </Typography>
          </Box>

          <Box sx={{ gap: 1, display: "flex", flexDirection: "column", flex: "1 1 auto" }}>
            <Typography
              color="inherit"
              variant="h6"
              sx={(theme) => ({
                ...theme.mixins.maxLine({ line: 2, persistent: theme.typography.h6 }),
              })}
            >
              {post.name}
            </Typography>

            <Typography
              variant="body2"
              sx={(theme) => ({
                ...theme.mixins.maxLine({ line: 2, persistent: theme.typography.body2 }),
                color: "text.secondary",
              })}
            >
              {post.description}
            </Typography>

            <Box sx={{ gap: 1.5, display: "flex", alignItems: "center", pt: 1.5 }}>
              <Avatar src={post.author.avatarUrl || DEFAULT_AVATAR_URL} />
              <Box sx={{ gap: 0.5, display: "flex", flexDirection: "column" }}>
                <Box component="span" sx={{ typography: "body2" }}>
                  {post.author.name}
                </Box>

                <Box
                  sx={{
                    gap: 0.5,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    color: "text.disabled",
                  }}
                >
                  <Typography variant="caption">{post.duration} min</Typography>
                  <Box
                    component="span"
                    sx={{
                      mx: 1,
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      backgroundColor: "currentColor",
                    }}
                  />
                  <Typography variant="caption">{post.category.name}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Link>
  );
}
