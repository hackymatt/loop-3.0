import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { SignUpView } from "src/sections/auth/sign-up-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <SignUpView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/sign-up.json`);

  const path = params.locale === LANGUAGE.PL ? paths.register : `/${LANGUAGE.EN}${paths.register}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
