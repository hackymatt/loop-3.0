import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { AboutView } from "src/sections/view/about-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <AboutView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/about.json`);

  const path = params.locale === LANGUAGE.PL ? paths.about : `/${LANGUAGE.EN}${paths.about}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
