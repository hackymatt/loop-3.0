import type { Metadata } from "next";
import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { projectQuery } from "src/api/project/project";
import { channelPostsQuery } from "src/api/project/channel/posts";

import { ChannelView } from "src/sections/view/channel-view";
import { NotFoundView } from "src/sections/error/not-found-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language; slug: string };
};

const queries = {
  project: (lang: Language, slug: string) => projectQuery(lang, slug),
  channelPosts: (lang: Language, slug: string) => channelPostsQuery(lang, slug),
};

async function getData(language: Language, slug: string) {
  try {
    const projectPromise = queries.project(language, slug).queryFn();
    const channelPostsPromise = queries.channelPosts(language, slug).queryFn();

    const [project, channelPosts] = await Promise.all([projectPromise, channelPostsPromise]);

    return {
      project: project.results,
      channelItems: channelPosts.results,
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

  return <ChannelView data={data} />;
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
