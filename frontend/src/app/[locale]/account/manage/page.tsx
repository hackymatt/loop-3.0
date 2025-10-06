import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { AccountManageView } from "src/sections/view/account-manage-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

export default function Page({ params }: PageProps) {
  return <AccountManageView language={params.locale} />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/account.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.account.manage : `/${LANGUAGE.EN}${paths.account.manage}`;

  return createMetadata({
    title: translations.meta.manage.title,
    description: translations.meta.manage.description,
    path,
  });
}
