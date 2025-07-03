import type { ICourseLevelProp, ICourseTechnologyProp } from "src/types/course";

import { useTranslation } from "react-i18next";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useFeaturedCourses } from "src/api/course/featured";
import { useCourseLevels } from "src/api/course/level/levels";
import { useCourseCategories } from "src/api/course/category/categories";
import { useCourseTechnologies } from "src/api/course/technology/technologies";

import { useUserContext } from "src/components/user";

// ----------------------------------------------------------------------

export const usePageLinks = () => {
  const { t } = useTranslation("navigation");
  const localize = useLocalizedPath();

  const { data: courseLevels } = useCourseLevels({ sort_by: "order", page_size: "-1" });
  const { data: courseTechnologies } = useCourseTechnologies({ page_size: "-1" });
  const { data: courseCategories } = useCourseCategories({ page_size: "-1" });

  const levelsSection = courseLevels?.length
    ? {
        subheader: t("levels"),
        items: courseLevels.map(({ slug, name }: ICourseLevelProp) => ({
          title: name,
          path: localize(`${paths.courses}?levels=${slug}`),
        })),
      }
    : null;

  const technologiesSection = courseTechnologies?.length
    ? {
        subheader: t("technologies"),
        items: courseTechnologies.map(({ slug, name }: ICourseTechnologyProp) => ({
          title: name,
          path: localize(`${paths.courses}?technologies=${slug}`),
        })),
      }
    : null;

  const categoriesSection = courseCategories?.length
    ? {
        subheader: t("categories"),
        items: courseCategories.map(({ slug, name }: ICourseTechnologyProp) => ({
          title: name,
          path: localize(`${paths.courses}?categories=${slug}`),
        })),
      }
    : null;

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

  return links;
};

const useCourseNav = () => {
  const { t } = useTranslation("navigation");
  const localize = useLocalizedPath();

  const { data: featuredCourses } = useFeaturedCourses();

  const children = usePageLinks();

  return {
    moreLink: {
      title: t("more"),
      path: localize(paths.courses),
    },
    tags: (featuredCourses || []).map((course) => ({
      title: course.name,
      path: localize(`${paths.course}/${course.slug}`),
    })),
    children,
  };
};
export const useNavData = () => {
  const { t } = useTranslation("navigation");
  const localize = useLocalizedPath();
  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const coursesNav = useCourseNav();

  return isLoggedIn
    ? [
        { title: t("courses"), path: localize(paths.courses), ...coursesNav },
        { title: t("certificates"), path: localize(paths.certificates) },
        { title: t("blog"), path: localize(paths.posts) },
        { title: t("contact"), path: localize(paths.contact) },
      ]
    : [
        { title: t("courses"), path: localize(paths.courses), ...coursesNav },
        { title: t("pricing"), path: localize(paths.pricing) },
        { title: t("blog"), path: localize(paths.posts) },
        { title: t("about"), path: localize(paths.about) },
        { title: t("contact"), path: localize(paths.contact) },
      ];
};
