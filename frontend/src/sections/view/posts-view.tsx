"use client";

import type {
  IBlogTagProp,
  IBlogTopicProp,
  IBlogListProps,
  IBlogRecentProps,
  IBlogFeaturedPost,
} from "src/types/blog";

import { useTranslation } from "react-i18next";

import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

import { paths } from "src/routes/paths";

import { useQueryParams } from "src/hooks/use-query-params";
import { useLocalizedPath } from "src/hooks/use-localized-path";

import { _mock } from "src/_mock";

import { Posts } from "../posts/posts";
import { Advertisement } from "../advertisement";
import { PostSidebar } from "../blog/post-sidebar";
import { FeaturedPost } from "../posts/featured-post";

// ----------------------------------------------------------------------
type PostsViewProps = {
  data: {
    postTopics: IBlogTopicProp[];
    postTags: IBlogTagProp[];
    featuredPosts: IBlogFeaturedPost[];
    recentPosts: IBlogRecentProps[];
    posts: IBlogListProps[];
    postsCount: number;
    postsPageSize: number;
  };
};

export function PostsView({ data }: PostsViewProps) {
  const { t } = useTranslation("advertisement");
  const localize = useLocalizedPath();

  const { handleChange, query } = useQueryParams();

  const { postTopics, postTags, featuredPosts, recentPosts, posts, postsCount, postsPageSize } =
    data;

  return (
    <>
      {!!featuredPosts?.length && <FeaturedPost post={featuredPosts[0]} />}
      <Container sx={{ pt: 10 }}>
        <Grid container spacing={{ md: 8 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Posts
              posts={posts || []}
              recordsCount={postsCount || 0}
              pagesCount={postsPageSize || 0}
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
                    imageUrl={_mock.image.project(6)}
                    action={
                      <Button variant="contained" color="primary" href={localize(paths.projects)}>
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
