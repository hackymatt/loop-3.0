import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { ActivateView } from "src/sections/auth/activate-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language; token: string };
};

export default function Page({ params }: PageProps) {
  return <ActivateView token={params.token} language={params.locale} />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/activate.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.auth.activate : `/${LANGUAGE.EN}${paths.auth.activate}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
