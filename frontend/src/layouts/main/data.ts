import type { Language } from "src/locales/types";
import type {
  IProjectListProps,
  IProjectLevelProp,
  IProjectCategoryProp,
  IProjectTechnologyProp,
} from "src/types/project";

import { featuredProjectsQuery } from "src/api/project/featured";
import { projectLevelsQuery } from "src/api/project/level/levels";
import { projectCategoriesQuery } from "src/api/project/category/categories";
import { projectTechnologiesQuery } from "src/api/project/technology/technologies";

// ----------------------------------------------------------------------

const queries = {
  featuredProjects: (lang: Language) => featuredProjectsQuery(lang),
  projectLevels: (lang: Language) =>
    projectLevelsQuery(lang, { sort_by: "order", page_size: "10" }),
  projectTechnologies: (lang: Language) => projectTechnologiesQuery(lang, { page_size: "10" }),
  projectCategories: (lang: Language) => projectCategoriesQuery(lang, { page_size: "10" }),
};

export async function getData(language: Language) {
  const entries = await Promise.all(
    Object.entries(queries).map(async ([key, getQuery]) => {
      const { queryFn } = getQuery(language);
      const { results } = await queryFn();
      return [key, results] as const;
    })
  );

  return Object.fromEntries(entries) as {
    featuredProjects: IProjectListProps[];
    projectLevels: IProjectLevelProp[];
    projectTechnologies: IProjectTechnologyProp[];
    projectCategories: IProjectCategoryProp[];
  };
}
