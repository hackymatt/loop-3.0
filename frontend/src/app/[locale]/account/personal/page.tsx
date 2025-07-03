import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { AccountPersonalView } from "src/sections/_account/view/account-personal-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <AccountPersonalView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/account.json`);

  const path =
    params.locale === LANGUAGE.PL
      ? paths.account.personal
      : `/${LANGUAGE.EN}${paths.account.personal}`;

  return createMetadata({
    title: translations.meta.personal.title,
    description: translations.meta.personal.description,
    path,
  });
}
