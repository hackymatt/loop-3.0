import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { AccountSubscriptionView } from "src/sections/_account/view/account-subscription-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

export default function Page({ params }: PageProps) {
  return <AccountSubscriptionView language={params.locale} />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/account.json`);

  const path =
    params.locale === LANGUAGE.PL
      ? paths.account.subscription
      : `/${LANGUAGE.EN}${paths.account.subscription}`;

  return createMetadata({
    title: translations.meta.subscription.title,
    description: translations.meta.subscription.description,
    path,
  });
}
