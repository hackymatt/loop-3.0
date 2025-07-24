import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { Error500View } from "src/sections/error/500-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

export default function Page500() {
  return <Error500View />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/500.json`);

  const path = params.locale === LANGUAGE.PL ? paths.page500 : `/${LANGUAGE.EN}${paths.page500}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
