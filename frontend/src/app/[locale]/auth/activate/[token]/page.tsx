import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { ActivateView } from "src/sections/auth/activate-view";

// ----------------------------------------------------------------------

export default function Page({ params }: { params: { token: string } }) {
  return <ActivateView token={params.token} />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/activate.json`);

  const path = params.locale === LANGUAGE.PL ? paths.activate : `/${LANGUAGE.EN}${paths.activate}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
