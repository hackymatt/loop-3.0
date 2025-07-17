import type { Language } from "src/locales/types";

import { MainLayout } from "src/layouts/main";
import { featuredProjectsQuery } from "src/api/project/featured";
import { projectLevelsQuery } from "src/api/project/level/levels";
import { projectCategoriesQuery } from "src/api/project/category/categories";
import { projectTechnologiesQuery } from "src/api/project/technology/technologies";

import { AccountLayout } from "src/sections/_account/layout";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

async function getFeaturedProjects(language: Language) {
  const { queryFn } = featuredProjectsQuery(language);
  const { results } = await queryFn();
  return results;
}

async function getProjectLevels(language: Language) {
  const { queryFn } = projectLevelsQuery(language, { sort_by: "order", page_size: "10" });
  const { results } = await queryFn();
  return results;
}

async function getProjectTechnologies(language: Language) {
  const { queryFn } = projectTechnologiesQuery(language, { page_size: "10" });
  const { results } = await queryFn();
  return results;
}

async function getProjectCategories(language: Language) {
  const { queryFn } = projectCategoriesQuery(language, { sort_by: "order", page_size: "10" });
  const { results } = await queryFn();
  return results;
}

async function getData(language: Language) {
  const featuredProjects = await getFeaturedProjects(language);
  const projectLevels = await getProjectLevels(language);
  const projectTechnologies = await getProjectTechnologies(language);
  const projectCategories = await getProjectCategories(language);
  return { featuredProjects, projectLevels, projectTechnologies, projectCategories };
}

export default async function Layout({ children, params }: Props) {
  const data = await getData(params.locale as Language);
  return (
    <MainLayout data={data}>
      <AccountLayout>{children}</AccountLayout>
    </MainLayout>
  );
}
