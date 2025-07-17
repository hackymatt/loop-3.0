import type { Language } from "src/locales/types";
import type {
  IBlogTagProp,
  IBlogListProps,
  IBlogTopicProp,
  IBlogRecentProps,
  IBlogFeaturedPost,
} from "src/types/blog";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { postsQuery } from "src/api/blog/posts";
import { postTagsQuery } from "src/api/blog/tag/tags";
import { recentPostsQuery } from "src/api/blog/recent";
import { featuredPostsQuery } from "src/api/blog/featured";
import { postTopicsQuery } from "src/api/blog/topic/topics";

import { PostsView } from "src/sections/view/posts-view";

// ----------------------------------------------------------------------
type SearchParams = Record<string, string>;

type PageProps = {
  params: { locale: Language };
  searchParams: SearchParams;
};

const queries = {
  postTopics: (lang: Language) => postTopicsQuery(lang, { page_size: "-1" }),
  postTags: (lang: Language) => postTagsQuery(lang, { page_size: "-1" }),
  featuredPosts: (lang: Language) => featuredPostsQuery(lang),
  recentPosts: (lang: Language) => recentPostsQuery(lang),
  posts: (lang: Language, searchParams: SearchParams) => postsQuery(lang, searchParams),
};

async function getData(language: Language, searchParams: SearchParams) {
  const postTopicsPromise = queries.postTopics(language).queryFn();
  const postTagsPromise = queries.postTags(language).queryFn();
  const featuredPostsPromise = queries.featuredPosts(language).queryFn();
  const recentPostsPromise = queries.recentPosts(language).queryFn();
  const postsPromise = queries.posts(language, searchParams).queryFn();

  const [postTopics, postTags, featuredPosts, recentPosts, posts] = await Promise.all([
    postTopicsPromise,
    postTagsPromise,
    featuredPostsPromise,
    recentPostsPromise,
    postsPromise,
  ]);

  return {
    postTopics: postTopics.results,
    postTags: postTags.results,
    featuredPosts: featuredPosts.results,
    recentPosts: recentPosts.results,
    posts: posts.results,
    postsCount: posts.count,
    postsPageSize: posts.pagesCount,
  } as {
    postTopics: IBlogTopicProp[];
    postTags: IBlogTagProp[];
    featuredPosts: IBlogFeaturedPost[];
    recentPosts: IBlogRecentProps[];
    posts: IBlogListProps[];
    postsCount: number;
    postsPageSize: number;
  };
}
export default async function Page({ params, searchParams }: PageProps) {
  const data = await getData(params.locale, searchParams);
  return <PostsView data={data} />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/blog.json`);

  const path = params.locale === LANGUAGE.PL ? paths.posts : `/${LANGUAGE.EN}${paths.posts}`;

  return createMetadata({
    title: translations.meta.posts.title,
    description: translations.meta.posts.description,
    path,
  });
}
