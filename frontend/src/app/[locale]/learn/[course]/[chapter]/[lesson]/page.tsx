import type { Metadata } from "next";
import type { ICourseLessonProp, ICourseChapterProp } from "src/types/course";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { URLS } from "src/api/urls";
import { CONFIG } from "src/global-config";
import { LANGUAGE } from "src/consts/language";

import { LearnView } from "src/sections/view/learn-view";

// ----------------------------------------------------------------------

export default function Page({
  params,
}: {
  params: { course: string; chapter: string; lesson: string };
}) {
  return (
    <LearnView courseSlug={params.course} chapterSlug={params.chapter} lessonSlug={params.lesson} />
  );
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; course: string; chapter: string; lesson: string };
}): Promise<Metadata> {
  const translations = await import(`public/locales/${params.locale}/learn.json`);

  const path = params.locale === LANGUAGE.PL ? paths.learn : `/${LANGUAGE.EN}${paths.learn}`;
  try {
    const res = await fetch(`${CONFIG.api}${URLS.COURSES}/${params.course}`, {
      headers: { "Content-Type": "application/json", "Accept-Language": params.locale },
    });

    if (!res.ok) throw new Error("Failed to fetch course");

    const course = await res.json();

    const { chapters } = course;

    const allLessons = chapters.flatMap((ch: ICourseChapterProp) => ch.lessons) ?? [];
    const lesson = allLessons.find((l: ICourseLessonProp) => l.slug === params.lesson);

    const { translated_name: name } = lesson;

    const title = translations.meta.title.replace("[name]", name);
    const description = translations.meta.description.replace("[name]", name);

    return createMetadata({
      title,
      description,
      path: `${path}/${params.course}/${params.chapter}/${params.lesson}`,
    });
  } catch {
    return createMetadata({
      title: translations.meta.title,
      description: translations.meta.description,
      path: `${path}/${params.course}/${params.chapter}/${params.lesson}`,
    });
  }
}
