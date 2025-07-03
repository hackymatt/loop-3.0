import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { HomeView } from "src/sections/view/home-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <HomeView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/home.json`);

  const path = params.locale === LANGUAGE.PL ? "" : `/${LANGUAGE.EN}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
