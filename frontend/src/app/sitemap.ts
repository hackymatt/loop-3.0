import type { MetadataRoute } from "next";
import type { Language } from "src/locales/types";
import type {
  IProjectLevelProp,
  IProjectListProps,
  IProjectCategoryProp,
  IProjectTechnologyProp,
} from "src/types/project";

import { paths } from "src/routes/paths";

import { CONFIG } from "src/global-config";
import { LANGUAGE } from "src/consts/language";
import { projectsQuery } from "src/api/project/projects";
import { projectLevelsQuery } from "src/api/project/level/levels";
import { projectCategoriesQuery } from "src/api/project/category/categories";
import { projectTechnologiesQuery } from "src/api/project/technology/technologies";

// ----------------------------------------------------------------------

const lastModified = new Date().toISOString();

const mapEntries = <T>(
  items: T[] | undefined,
  urlBuilder: (item: T) => string
): MetadataRoute.Sitemap =>
  (items ?? []).map((item) => ({
    url: urlBuilder(item),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

async function getDynamicEntries(
  baseUrl: string,
  language: Language
): Promise<MetadataRoute.Sitemap> {
  try {
    const [projects, levels, technologies, categories] = await Promise.all([
      projectsQuery(language, { page_size: "-1" }).queryFn(),
      projectLevelsQuery(language, { page_size: "-1" }).queryFn(),
      projectTechnologiesQuery(language, { page_size: "-1" }).queryFn(),
      projectCategoriesQuery(language, { page_size: "-1" }).queryFn(),
    ]);

    return [
      ...mapEntries(
        projects.results,
        (p: IProjectListProps) => `${baseUrl}${paths.project}/${p.slug}`
      ),
      ...mapEntries(
        levels.results,
        (l: IProjectLevelProp) => `${baseUrl}${paths.projects}?levels=${l.slug}`
      ),
      ...mapEntries(
        technologies.results,
        (t: IProjectTechnologyProp) => `${baseUrl}${paths.projects}?technologies=${t.slug}`
      ),
      ...mapEntries(
        categories.results,
        (c: IProjectCategoryProp) => `${baseUrl}${paths.projects}?categories=${c.slug}`
      ),
    ];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const envPrefix = CONFIG.env === "PROD" ? "" : `${CONFIG.env.toLowerCase()}.`;
  const baseUrl =
    CONFIG.env === "LOCAL" ? "http://localhost:3000" : `https://${envPrefix}loop.edu.pl`;

  const locales = Object.values(LANGUAGE);

  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    [
      { path: "", priority: 1, changeFrequency: "always" as const },
      { path: paths.projects, priority: 0.9, changeFrequency: "always" as const },
      { path: paths.posts, priority: 0.8, changeFrequency: "always" as const },
      { path: paths.about, priority: 0.5, changeFrequency: "yearly" as const },
      { path: paths.contact, priority: 0.5, changeFrequency: "yearly" as const },
      { path: paths.auth.login, priority: 0.9, changeFrequency: "yearly" as const },
      { path: paths.auth.register, priority: 0.9, changeFrequency: "yearly" as const },
      { path: paths.auth.resetPassword, priority: 0.9, changeFrequency: "yearly" as const },
      { path: paths.auth.updatePassword, priority: 0.9, changeFrequency: "yearly" as const },
      { path: paths.account.dashboard, priority: 0.9, changeFrequency: "always" as const },
      { path: paths.support, priority: 0.6, changeFrequency: "monthly" as const },
      { path: paths.pricing, priority: 0.6, changeFrequency: "monthly" as const },
      { path: paths.privacyPolicy, priority: 0.5, changeFrequency: "yearly" as const },
      { path: paths.termsOfService, priority: 0.5, changeFrequency: "yearly" as const },
    ].map(({ path, priority, changeFrequency }) => ({
      url: locale === LANGUAGE.PL ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`,
      lastModified,
      priority,
      changeFrequency,
    }))
  );

  const dynamicResults = await Promise.allSettled(
    locales.map((locale) =>
      getDynamicEntries(locale === LANGUAGE.PL ? baseUrl : `${baseUrl}/${locale}`, locale)
    )
  );

  const dynamicRoutes = dynamicResults.flatMap((res) =>
    res.status === "fulfilled" ? res.value : []
  );

  return [...staticRoutes, ...dynamicRoutes];
}
