import type { Metadata } from "next";
import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { reviewsQuery } from "src/api/review/reviews";
import { projectQuery } from "src/api/project/project";

import { ProjectView } from "src/sections/view/project-view";
import { NotFoundView } from "src/sections/error/not-found-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language; slug: string };
};

const queries = {
  project: (lang: Language, slug: string) => projectQuery(lang, slug),
  reviews: (lang: Language, slug: string) => reviewsQuery(lang, slug),
};

async function getData(language: Language, slug: string) {
  try {
    const projectPromise = queries.project(language, slug).queryFn();
    const reviewsPromise = queries.reviews(language, slug).queryFn();

    const [project, reviews] = await Promise.all([projectPromise, reviewsPromise]);

    return {
      project: project.results,
      reviews: reviews.results,
      reviewsCount: reviews.count,
      reviewsPageSize: reviews.pagesCount,
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

  return <ProjectView slug={params.slug} data={data} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const translations = await import(`public/locales/${params.locale}/project.json`);

  const path = params.locale === LANGUAGE.PL ? paths.project : `/${LANGUAGE.EN}${paths.project}`;
  try {
    const project = (await queries.project(params.locale, params.slug).queryFn()).results;

    const { name, technologies } = project;

    const title = translations.meta.project.title.replace("[name]", name);
    const description = translations.meta.project.description
      .replace("[name]", name)
      .replace(
        "[technologyName]",
        technologies.map((tech: { name: string }) => tech.name).join(", ")
      );

    return createMetadata({ title, description, path: `${path}/${params.slug}` });
  } catch {
    const notFoundTranslations = await import(`public/locales/${params.locale}/404.json`);

    return createMetadata({
      title: notFoundTranslations.meta.title,
      description: notFoundTranslations.meta.description,
      path,
    });
  }
}
