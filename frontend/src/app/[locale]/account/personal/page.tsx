import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { dataQuery } from "src/api/me/personal";

import { AccountPersonalView } from "src/sections/view/account-personal-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

export default async function Page() {
  const data = (await dataQuery().queryFn()).results;
  return <AccountPersonalView data={data} />;
}

export async function generateMetadata({ params }: PageProps) {
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
