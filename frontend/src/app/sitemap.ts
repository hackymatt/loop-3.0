import type { MetadataRoute } from "next";
import type { Language } from "src/locales/types";
import type {
  ICourseLevelProp,
  ICourseListProps,
  ICourseCategoryProp,
  ICourseTechnologyProp,
} from "src/types/course";

import { paths } from "src/routes/paths";

import { URLS } from "src/api/urls";
import { CONFIG } from "src/global-config";
import { LANGUAGE } from "src/consts/language";

async function getCourses(baseUrl: string, language: Language) {
  const res = await fetch(`${CONFIG.api}${URLS.COURSES}?page_size=-1`, {
    headers: { "Content-Type": "application/json", "Accept-Language": language },
  });

  if (!res.ok) throw new Error("Failed to fetch courses");

  const data = await res.json();

  return (data.results ?? []).map((course: ICourseListProps) => ({
    url: `${baseUrl}${paths.course}/${course.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
}

async function getLevels(baseUrl: string, language: Language) {
  const res = await fetch(`${CONFIG.api}${URLS.COURSE_LEVELS}?page_size=-1`, {
    headers: { "Content-Type": "application/json", "Accept-Language": language },
  });

  if (!res.ok) throw new Error("Failed to fetch levels");

  const data = await res.json();

  return (data.results ?? []).map((level: ICourseLevelProp) => ({
    url: `${baseUrl}${paths.courses}?levels=${level.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
}

async function getTechnologies(baseUrl: string, language: Language) {
  const res = await fetch(`${CONFIG.api}${URLS.COURSE_TECHNOLOGIES}?page_size=-1`, {
    headers: { "Content-Type": "application/json", "Accept-Language": language },
  });

  if (!res.ok) throw new Error("Failed to fetch technologies");

  const data = await res.json();

  return (data.results ?? []).map((technology: ICourseTechnologyProp) => ({
    url: `${baseUrl}${paths.courses}?technologies=${technology.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
}

async function getCategories(baseUrl: string, language: Language) {
  const res = await fetch(`${CONFIG.api}${URLS.COURSE_CATEGORIES}?page_size=-1`, {
    headers: { "Content-Type": "application/json", "Accept-Language": language },
  });

  if (!res.ok) throw new Error("Failed to fetch categories");

  const data = await res.json();

  return (data.results ?? []).map((category: ICourseCategoryProp) => ({
    url: `${baseUrl}${paths.courses}?categories=${category.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
}

async function fetchData(baseUrl: string, language: Language): Promise<MetadataRoute.Sitemap> {
  try {
    const courses = await getCourses(baseUrl, language);
    const levels = await getLevels(baseUrl, language);
    const technologies = await getTechnologies(baseUrl, language);
    const categories = await getCategories(baseUrl, language);

    return [...courses, ...levels, ...technologies, ...categories];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Check if the environment is local
  const envPrefix = CONFIG.env === "PROD" ? "" : `${CONFIG.env.toLowerCase()}.`;

  // Set baseUrl depending on the environment
  const baseUrl =
    CONFIG.env === "LOCAL" ? "http://localhost:3000" : `https://${envPrefix}loop.edu.pl`;

  const lastModified = new Date().toISOString();
  const locales = Object.values(LANGUAGE);

  const routeConfig = [
    { path: "", priority: 1, changeFrequency: "always" },
    { path: paths.courses, priority: 0.9, changeFrequency: "always" },
    { path: paths.posts, priority: 0.8, changeFrequency: "always" },
    { path: paths.about, priority: 0.5, changeFrequency: "yearly" },
    { path: paths.contact, priority: 0.5, changeFrequency: "yearly" },
    { path: paths.login, priority: 0.9, changeFrequency: "yearly" },
    { path: paths.register, priority: 0.9, changeFrequency: "yearly" },
    { path: paths.resetPassword, priority: 0.9, changeFrequency: "yearly" },
    { path: paths.updatePassword, priority: 0.9, changeFrequency: "yearly" },
    { path: paths.account.dashboard, priority: 0.9, changeFrequency: "always" },
    { path: paths.support, priority: 0.6, changeFrequency: "monthly" },
    { path: paths.pricing, priority: 0.6, changeFrequency: "monthly" },
    { path: paths.privacyPolicy, priority: 0.5, changeFrequency: "yearly" },
    { path: paths.termsOfService, priority: 0.5, changeFrequency: "yearly" },
  ] as const;

  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    routeConfig.map(({ path, priority, changeFrequency }) => ({
      url: locale === LANGUAGE.PL ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`,
      lastModified,
      priority,
      changeFrequency,
    }))
  );

  const dynamicResults = await Promise.all(
    locales.map((locale) =>
      fetchData(locale === LANGUAGE.PL ? baseUrl : `${baseUrl}/${locale}`, locale)
    )
  );

  const dynamicRoutes = dynamicResults.flat();

  return [...staticRoutes, ...dynamicRoutes];
}
