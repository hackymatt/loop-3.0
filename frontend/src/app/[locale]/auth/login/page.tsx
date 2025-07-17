import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { SignInView } from "src/sections/auth/sign-in-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <SignInView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/sign-in.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.auth.login : `/${LANGUAGE.EN}${paths.auth.login}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
