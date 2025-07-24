import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { UpdatePasswordView } from "src/sections/auth/update-password-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language; token: string };
};

export default function Page({ params }: PageProps) {
  return <UpdatePasswordView token={params.token} />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/update-password.json`);

  const path =
    params.locale === LANGUAGE.PL
      ? paths.auth.updatePassword
      : `/${LANGUAGE.EN}${paths.auth.updatePassword}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
