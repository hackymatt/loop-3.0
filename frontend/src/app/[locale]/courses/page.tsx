import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { CoursesView } from "src/sections/view/courses-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <CoursesView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/course.json`);

  const path = params.locale === LANGUAGE.PL ? paths.courses : `/${LANGUAGE.EN}${paths.courses}`;

  return createMetadata({
    title: translations.meta.courses.title,
    description: translations.meta.courses.description,
    path,
  });
}
