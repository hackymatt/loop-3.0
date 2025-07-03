import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { UpdatePasswordView } from "src/sections/auth/update-password-view";

// ----------------------------------------------------------------------

export default function Page({ params }: { params: { token: string } }) {
  return <UpdatePasswordView token={params.token} />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/update-password.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.updatePassword : `/${LANGUAGE.EN}${paths.updatePassword}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
