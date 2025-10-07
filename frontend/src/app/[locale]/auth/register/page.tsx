import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { SignUpView } from "src/sections/auth/sign-up-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

export default function Page({ params }: PageProps) {
  return <SignUpView language={params.locale} />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/sign-up.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.auth.register : `/${LANGUAGE.EN}${paths.auth.register}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
