import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { plansQuery } from "src/api/plan/plans";
import { projectsQuery } from "src/api/project/projects";
import { projectTagsQuery } from "src/api/project/tag/tags";
import { projectLevelsQuery } from "src/api/project/level/levels";
import { projectCategoriesQuery } from "src/api/project/category/categories";
import { projectTechnologiesQuery } from "src/api/project/technology/technologies";

import { ProjectsView } from "src/sections/view/projects-view";

// ----------------------------------------------------------------------
type SearchParams = Record<string, string>;

type PageProps = {
  params: { locale: Language };
  searchParams: SearchParams;
};

const queries = {
  projectLevels: (lang: Language) =>
    projectLevelsQuery(lang, { sort_by: "order", page_size: "-1" }),
  projectTechnologies: (lang: Language) => projectTechnologiesQuery(lang, { page_size: "-1" }),
  projectCategories: (lang: Language) => projectCategoriesQuery(lang, { page_size: "-1" }),
  projectTags: (lang: Language) => projectTagsQuery(lang, { page_size: "-1" }),
  projects: (lang: Language, searchParams: SearchParams) => projectsQuery(lang, searchParams),
  plans: (lang: Language) => plansQuery(lang),
};

async function getData(language: Language, searchParams: SearchParams) {
  const projectLevelsPromise = queries.projectLevels(language).queryFn();
  const projectTechnologiesPromise = queries.projectTechnologies(language).queryFn();
  const projectCategoriesPromise = queries.projectCategories(language).queryFn();
  const projectTagsPromise = queries.projectTags(language).queryFn();
  const plansPromise = queries.plans(language).queryFn();
  const projectsPromise = queries.projects(language, searchParams).queryFn();

  const [projectLevels, projectTechnologies, projectCategories, projectTags, plans, projects] =
    await Promise.all([
      projectLevelsPromise,
      projectTechnologiesPromise,
      projectCategoriesPromise,
      projectTagsPromise,
      plansPromise,
      projectsPromise,
    ]);

  return {
    projectLevels: projectLevels.results,
    projectTechnologies: projectTechnologies.results,
    projectCategories: projectCategories.results,
    projectTags: projectTags.results,
    plans: plans.results,
    projects: projects.results,
    projectsCount: projects.count,
    projectsPageSize: projects.pagesCount,
  };
}
export default async function Page({ params, searchParams }: PageProps) {
  const data = await getData(params.locale, searchParams);
  return <ProjectsView data={data} />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/project.json`);

  const path = params.locale === LANGUAGE.PL ? paths.projects : `/${LANGUAGE.EN}${paths.projects}`;

  return createMetadata({
    title: translations.meta.projects.title,
    description: translations.meta.projects.description,
    path,
  });
}
