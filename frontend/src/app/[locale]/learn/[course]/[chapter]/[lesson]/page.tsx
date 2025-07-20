import type { Metadata } from "next";
import type { IProjectSubstepProp, IProjectStepProp } from "src/types/project";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { URLS } from "src/api/urls";
import { CONFIG } from "src/global-config";
import { LANGUAGE } from "src/consts/language";

import { LearnView } from "src/sections/view/learn-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: string; project: string; stage: string; step: string };
};

export default function Page({ params }: PageProps) {
  return (
    <LearnView projectSlug={params.project} stepSlug={params.stage} substepSlug={params.step} />
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const translations = await import(`public/locales/${params.locale}/learn.json`);

  const path = params.locale === LANGUAGE.PL ? paths.learn : `/${LANGUAGE.EN}${paths.learn}`;
  try {
    const res = await fetch(`${CONFIG.api}${URLS.PROJECTS}/${params.project}`, {
      headers: { "Content-Type": "application/json", "Accept-Language": params.locale },
    });

    if (!res.ok) throw new Error("Failed to fetch project");

    const project = await res.json();

    const { steps } = project;

    const allSubsteps = steps.flatMap((ch: IProjectStepProp) => ch.substeps) ?? [];
    const substep = allSubsteps.find((l: IProjectSubstepProp) => l.slug === params.step);

    const { translated_name: name } = substep;

    const title = translations.meta.title.replace("[name]", name);
    const description = translations.meta.description.replace("[name]", name);

    return createMetadata({
      title,
      description,
      path: `${path}/${params.project}/${params.stage}/${params.step}`,
    });
  } catch {
    return createMetadata({
      title: translations.meta.title,
      description: translations.meta.description,
      path: `${path}/${params.project}/${params.stage}/${params.step}`,
    });
  }
}
