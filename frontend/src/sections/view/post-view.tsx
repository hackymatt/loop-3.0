"use client";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { fDate } from "src/utils/format-time";

import { usePost } from "src/api/blog/post";
import { useRecentPosts } from "src/api/blog/recent";
import { DEFAULT_AVATAR_URL } from "src/consts/avatar";
import { useFeaturedPosts } from "src/api/blog/featured";

import { Image } from "src/components/image";
import { Iconify } from "src/components/iconify";
import { Markdown } from "src/components/markdown";
import { SplashScreen } from "src/components/loading-screen";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";

import { PostTags } from "../blog/post-tags";
import { LatestPosts } from "../posts/latest-posts";
import { NotFoundView } from "../error/not-found-view";
import { PrevNextButton } from "../blog/post-prev-and-next";

// ----------------------------------------------------------------------

export function PostView({ slug }: { slug: string }) {
  const { t } = useTranslation("navigation");
  const localize = useLocalizedPath();

  const { data: post, isError, isLoading } = usePost(slug);
  const { data: featuredPosts } = useFeaturedPosts();
  const { data: recentPosts } = useRecentPosts();

  const renderHead = () => (
    <Box sx={{ textAlign: "center", mt: { xs: 5, md: 10 } }}>
      <Box
        sx={{
          gap: 0.5,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          color: "text.disabled",
        }}
      >
        <Typography variant="body2">{post?.duration} min</Typography>
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
        <Typography variant="body2">{post?.category.name}</Typography>
      </Box>

      <Typography variant="h2" component="h1" sx={{ my: 3 }}>
        {post?.name}
      </Typography>

      <Typography variant="h5" component="p">
        {post?.description}
      </Typography>
    </Box>
  );

  const renderToolbar = () => (
    <Box
      sx={[
        (theme) => ({
          py: 3,
          my: 5,
          display: "flex",
          alignItems: "center",
          borderTop: `solid 1px ${theme.vars.palette.divider}`,
          borderBottom: `solid 1px ${theme.vars.palette.divider}`,
        }),
      ]}
    >
      <Avatar
        src={post?.author.avatarUrl || DEFAULT_AVATAR_URL}
        sx={{ mr: 2, width: 48, height: 48 }}
      />

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2">{post?.author.name}</Typography>
        <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: "text.secondary" }}>
          {fDate(post?.publishedAt)}
        </Typography>
      </Box>

      <IconButton
        onClick={() =>
          navigator.share({
            url: localize(`${paths.post}/${post?.slug}`),
            title: post?.name,
            text: post?.description,
          })
        }
      >
        <Iconify icon="solar:share-outline" />
      </IconButton>
    </Box>
  );

  const renderVideo = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        justifyContent: "center",
      }}
    >
      <Image
        alt={post?.name}
        src={post?.heroUrl}
        ratio={{ xs: "16/9", md: "21/9" }}
        sx={{ borderRadius: 2 }}
      />
    </Box>
  );
  const renderPrevNextButtons = () => (
    <Box
      sx={{
        gap: 5,
        py: 10,
        display: "grid",
        gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" },
      }}
    >
      {post?.prevPost ? (
        <PrevNextButton
          title={post?.prevPost.name}
          coverUrl={post?.prevPost.heroUrl}
          href={localize(`${paths.post}/${post?.prevPost.slug}`)}
        />
      ) : (
        <Box />
      )}

      {post?.nextPost ? (
        <PrevNextButton
          isNext
          title={post?.nextPost.name}
          coverUrl={post?.nextPost.heroUrl}
          href={localize(`${paths.post}/${post?.nextPost.slug}`)}
        />
      ) : (
        <Box />
      )}
    </Box>
  );

  if (isError) {
    return <NotFoundView />;
  }

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <>
      <Divider />

      <Container>
        <CustomBreadcrumbs
          links={[
            { name: t("home"), href: localize(paths.home) },
            { name: t("blog"), href: localize(paths.posts) },
            { name: post?.name },
          ]}
          sx={{ my: { xs: 3, md: 5 } }}
        />
        {renderVideo()}
        <Grid container spacing={3} sx={{ justifyContent: { md: "center" } }}>
          <Grid size={{ xs: 12, md: 8 }}>
            {renderHead()}

            {renderToolbar()}

            {post && <Markdown content={post.content} />}

            {!!post?.tags.length && <PostTags tags={post?.tags} />}

            <Divider sx={{ mt: 10 }} />

            {(post?.prevPost || post?.nextPost) && renderPrevNextButtons()}
          </Grid>
        </Grid>
      </Container>

      <Divider />

      {!!featuredPosts?.length && !!recentPosts?.length && (
        <LatestPosts
          largePost={featuredPosts[0]}
          smallPosts={recentPosts}
          sx={{ bgcolor: "background.neutral" }}
        />
      )}
    </>
  );
}
