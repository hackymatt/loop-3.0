import type {
  IProjectLevelProp,
  IProjectListProps,
  IProjectCategoryProp,
  IProjectTechnologyProp,
} from "src/types/project";

import { useTranslation } from "react-i18next";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useUserContext } from "src/components/user";

// ----------------------------------------------------------------------

type Data = {
  featuredProjects: IProjectListProps[];
  projectLevels: IProjectLevelProp[];
  projectTechnologies: IProjectTechnologyProp[];
  projectCategories: IProjectCategoryProp[];
};

export const usePageLinks = (data: Data) => {
  const { t } = useTranslation("navigation");
  const localize = useLocalizedPath();

  const { projectLevels, projectTechnologies, projectCategories } = data;

  const levelsSection = projectLevels?.length
    ? {
        subheader: t("levels"),
        items: projectLevels.map(({ slug, name }: IProjectLevelProp) => ({
          title: name,
          path: localize(`${paths.projects}?levels=${slug}`),
        })),
      }
    : null;

  const technologiesSection = projectTechnologies?.length
    ? {
        subheader: t("technologies"),
        items: projectTechnologies.map(({ slug, name }: IProjectTechnologyProp) => ({
          title: name,
          path: localize(`${paths.projects}?technologies=${slug}`),
        })),
      }
    : null;

  const categoriesSection = projectCategories?.length
    ? {
        subheader: t("categories"),
        items: projectCategories.map(({ slug, name }: IProjectTechnologyProp) => ({
          title: name,
          path: localize(`${paths.projects}?categories=${slug}`),
        })),
      }
    : null;

  const durationSection = {
    subheader: t("duration.label"),
    items: [
      {
        title: t("duration.short"),
        path: localize(`${paths.projects}?duration=short`),
      },
      {
        title: t("duration.medium"),
        path: localize(`${paths.projects}?duration=medium`),
      },
      {
        title: t("duration.long"),
        path: localize(`${paths.projects}?duration=long`),
      },
    ],
  };

  const links = [];

  if (levelsSection) {
    links.push(levelsSection);
  }
  if (technologiesSection) {
    links.push(technologiesSection);
  }
  if (categoriesSection) {
    links.push(categoriesSection);
  }
  links.push(durationSection);

  return links;
};

const useProjectNav = (data: Data) => {
  const { t } = useTranslation("navigation");
  const localize = useLocalizedPath();

  const { featuredProjects } = data;

  const children = usePageLinks(data);

  return {
    moreLink: {
      title: t("more"),
      path: localize(paths.projects),
    },
    tags: (featuredProjects || []).map((project) => ({
      title: project.name,
      path: localize(`${paths.project}/${project.slug}`),
    })),
    children,
  };
};

export const useNavData = (data: Data) => {
  const { t } = useTranslation("navigation");
  const localize = useLocalizedPath();
  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const projectsNav = useProjectNav(data);

  return isLoggedIn
    ? [
        { title: t("projects"), path: localize(paths.projects), ...projectsNav },
        { title: t("certificates"), path: localize(paths.certificates) },
        { title: t("blog"), path: localize(paths.posts) },
        { title: t("contact"), path: localize(paths.contact) },
      ]
    : [
        { title: t("projects"), path: localize(paths.projects), ...projectsNav },
        { title: t("pricing"), path: localize(paths.pricing) },
        { title: t("blog"), path: localize(paths.posts) },
        { title: t("about"), path: localize(paths.about) },
        { title: t("contact"), path: localize(paths.contact) },
      ];
};
