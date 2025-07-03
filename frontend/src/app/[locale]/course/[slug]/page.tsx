import type { Metadata } from "next";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { URLS } from "src/api/urls";
import { CONFIG } from "src/global-config";
import { LANGUAGE } from "src/consts/language";

import { CourseView } from "src/sections/view/course-view";

// ----------------------------------------------------------------------
export default function Page({ params }: { params: { slug: string } }) {
  return <CourseView slug={params.slug} />;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const translations = await import(`public/locales/${params.locale}/course.json`);

  const path = params.locale === LANGUAGE.PL ? paths.course : `/${LANGUAGE.EN}${paths.course}`;
  try {
    const res = await fetch(`${CONFIG.api}${URLS.COURSES}/${params.slug}`, {
      headers: { "Content-Type": "application/json", "Accept-Language": params.locale },
    });

    if (!res.ok) throw new Error("Failed to fetch course");

    const course = await res.json();

    const {
      translated_name: name,
      technology: { name: technologyName },
    } = course;

    const title = translations.meta.course.title.replace("[name]", name);
    const description = translations.meta.course.description
      .replace("[name]", name)
      .replace("[technologyName]", technologyName);

    return createMetadata({ title, description, path: `${path}/${params.slug}` });
  } catch {
    return createMetadata({
      title: translations.meta.course.title,
      description: translations.meta.course.description,
      path: `${path}/${params.slug}`,
    });
  }
}
