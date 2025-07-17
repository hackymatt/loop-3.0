import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { ResetPasswordView } from "src/sections/auth/reset-password-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <ResetPasswordView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/reset-password.json`);

  const path =
    params.locale === LANGUAGE.PL
      ? paths.auth.resetPassword
      : `/${LANGUAGE.EN}${paths.auth.resetPassword}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
