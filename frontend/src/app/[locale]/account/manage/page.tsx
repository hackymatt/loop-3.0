import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { AccountManageView } from "src/sections/_account/view/account-manage-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <AccountManageView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/account.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.account.manage : `/${LANGUAGE.EN}${paths.account.manage}`;

  return createMetadata({
    title: translations.meta.manage.title,
    description: translations.meta.manage.description,
    path,
  });
}
