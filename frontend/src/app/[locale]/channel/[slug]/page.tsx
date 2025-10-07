import type { Metadata } from "next";
import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { projectQuery } from "src/api/project/project";
import { channelPostsQuery } from "src/api/project/channel/list";

import { ChannelView } from "src/sections/view/channel-view";
import { NotFoundView } from "src/sections/error/not-found-view";

// ----------------------------------------------------------------------
type SearchParams = Record<string, string>;

type PageProps = {
  params: { locale: Language; slug: string };
  searchParams: SearchParams;
};

const queries = {
  project: (lang: Language, slug: string) => projectQuery(lang, slug),
  channelPosts: (lang: Language, slug: string, searchParams: SearchParams) =>
    channelPostsQuery(lang, slug, searchParams),
};

async function getData(language: Language, slug: string, searchParams: SearchParams) {
  try {
    const projectPromise = queries.project(language, slug).queryFn();
    const channelPostsPromise = queries.channelPosts(language, slug, searchParams).queryFn();

    const [project, channelPosts] = await Promise.all([projectPromise, channelPostsPromise]);

    return {
      project: project.results,
      channelItems: channelPosts.results,
      channelItemsCount: channelPosts.count,
      channelItemsPageSize: channelPosts.pagesCount,
      isLocked: channelPosts.error?.status === 403,
    };
  } catch {
    return null;
  }
}
export default async function Page({ params, searchParams }: PageProps) {
  const data = await getData(params.locale, params.slug, searchParams);

  if (!data) {
    return <NotFoundView />;
  }

  return <ChannelView data={data} language={params.locale} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const translations = await import(`public/locales/${params.locale}/channel.json`);

  const path = params.locale === LANGUAGE.PL ? paths.channel : `/${LANGUAGE.EN}${paths.channel}`;
  try {
    const project = (await queries.project(params.locale, params.slug).queryFn()).results;

    const { name } = project;

    const title = translations.meta.title.replace("[name]", name);
    const description = translations.meta.description.replace("[name]", name);

    return createMetadata({
      title,
      description,
      path: `${path}/${params.slug}`,
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
