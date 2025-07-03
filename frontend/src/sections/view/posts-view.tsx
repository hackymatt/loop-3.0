"use client";

import { useTranslation } from "react-i18next";

import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

import { paths } from "src/routes/paths";

import { useQueryParams } from "src/hooks/use-query-params";
import { useLocalizedPath } from "src/hooks/use-localized-path";

import { _mock } from "src/_mock";
import { usePosts } from "src/api/blog/posts";
import { usePostTags } from "src/api/blog/tag/tags";
import { useRecentPosts } from "src/api/blog/recent";
import { useFeaturedPosts } from "src/api/blog/featured";
import { usePostTopics } from "src/api/blog/topic/topics";

import { Posts } from "../posts/posts";
import { Advertisement } from "../advertisement";
import { PostSidebar } from "../blog/post-sidebar";
import { FeaturedPost } from "../posts/featured-post";

// ----------------------------------------------------------------------

export function PostsView() {
  const { t } = useTranslation("advertisement");
  const localize = useLocalizedPath();

  const { handleChange, query } = useQueryParams();

  const { data: postTopics } = usePostTopics();
  const { data: postTags } = usePostTags();
  const { data: featuredPosts } = useFeaturedPosts();
  const { data: recentPosts } = useRecentPosts();
  const { data: posts, count, pageSize } = usePosts(query);

  return (
    <>
      {!!featuredPosts?.length && <FeaturedPost post={featuredPosts[0]} />}
      <Container sx={{ pt: 10 }}>
        <Grid container spacing={{ md: 8 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Posts
              posts={posts || []}
              recordsCount={count || 0}
              pagesCount={pageSize || 0}
              page={Number(query.page) || 1}
              onPageChange={(selectedPage: number) => handleChange("page", String(selectedPage))}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <PostSidebar
              tags={postTags || []}
              categories={postTopics || []}
              recentPosts={recentPosts || []}
              slots={{
                bottomNode: (
                  <Advertisement
                    title={t("title")}
                    description={t("subtitle")}
                    imageUrl={_mock.image.course(6)}
                    action={
                      <Button variant="contained" color="primary" href={localize(paths.courses)}>
                        {t("button")}
                      </Button>
                    }
                    sx={{ mb: 5 }}
                  />
                ),
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
