import type { Metadata } from "next";
import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { postQuery } from "src/api/blog/post";
import { LANGUAGE } from "src/consts/language";
import { recentPostsQuery } from "src/api/blog/recent";
import { featuredPostsQuery } from "src/api/blog/featured";

import { PostView } from "src/sections/view/post-view";
import { NotFoundView } from "src/sections/error/not-found-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language; slug: string };
};

const queries = {
  post: (lang: Language, slug: string) => postQuery(lang, slug),
  featuredPosts: (lang: Language) => featuredPostsQuery(lang),
  recentPosts: (lang: Language) => recentPostsQuery(lang),
};

async function getData(language: Language, slug: string) {
  try {
    const postPromise = queries.post(language, slug).queryFn();
    const featuredPostsPromise = queries.featuredPosts(language).queryFn();
    const recentPostsPromise = queries.recentPosts(language).queryFn();

    const [post, featuredPosts, recentPosts] = await Promise.all([
      postPromise,
      featuredPostsPromise,
      recentPostsPromise,
    ]);

    return {
      post: post.results,
      featuredPosts: featuredPosts.results,
      recentPosts: recentPosts.results,
    };
  } catch {
    return null;
  }
}
export default async function Page({ params }: PageProps) {
  const data = await getData(params.locale, params.slug);

  if (!data) {
    return <NotFoundView />;
  }
  return <PostView data={data} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const translations = await import(`public/locales/${params.locale}/blog.json`);

  const path = params.locale === LANGUAGE.PL ? paths.posts : `/${LANGUAGE.EN}${paths.posts}`;
  try {
    const post = (await queries.post(params.locale, params.slug).queryFn()).results;

    const { name, heroUrl } = post;

    const title = translations.meta.post.title.replace("[name]", name);
    const description = translations.meta.post.description.replace("[name]", name);
    const coverUrl = heroUrl;

    return createMetadata({
      title,
      description,
      path: `${path}/${params.slug}`,
      image: coverUrl,
    });
  } catch {
    const notFoundTranslations = await import(`public/locales/${params.locale}/404.json`);

    return createMetadata({
      title: notFoundTranslations.meta.title,
      description: notFoundTranslations.meta.description,
      path,
    });
  }
}
