import type { Metadata } from "next";
import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { stepQuery } from "src/api/project/step/step";
import { projectQuery } from "src/api/project/project";

import { LearnView } from "src/sections/view/learn-view";
import { NotFoundView } from "src/sections/error/not-found-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language; project: string; stage: string; step: string };
};

const queries = {
  project: (lang: Language, slug: string) => projectQuery(lang, slug),
  step: (lang: Language, projectSlug: string, stageSlug: string, stepSlug: string) =>
    stepQuery(lang, projectSlug, stageSlug, stepSlug),
};

async function getData(
  language: Language,
  projectSlug: string,
  stageSlug: string,
  stepSlug: string
) {
  try {
    const projectPromise = queries.project(language, projectSlug).queryFn();
    const stepPromise = queries.step(language, projectSlug, stageSlug, stepSlug).queryFn();

    const [project, step] = await Promise.all([projectPromise, stepPromise]);

    return {
      project: project.results,
      step: step.results,
      isLocked: step.error?.status === 403,
    };
  } catch {
    return null;
  }
}
export default async function Page({ params }: PageProps) {
  const data = await getData(params.locale, params.project, params.stage, params.step);

  if (!data) {
    return <NotFoundView />;
  }

  return (
    <LearnView
      data={data}
      locale={params.locale}
      projectSlug={params.project}
      stageSlug={params.stage}
      stepSlug={params.step}
    />
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const translations = await import(`public/locales/${params.locale}/learn.json`);

  const path = params.locale === LANGUAGE.PL ? paths.learn : `/${LANGUAGE.EN}${paths.learn}`;
  try {
    const project = (await queries.project(params.locale, params.project).queryFn()).results;

    const { stages } = project;

    const allSteps = stages.flatMap((stage) => stage.steps) ?? [];
    const step = allSteps.find((s) => s.slug === params.step)!;

    const { name } = step;

    const title = translations.meta.title.replace("[name]", name);
    const description = translations.meta.description.replace("[name]", name);

    return createMetadata({
      title,
      description,
      path: `${path}/${params.project}/${params.stage}/${params.step}`,
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
