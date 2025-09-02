import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { subscriptionQuery } from "src/api/me/subscription";

import { AccountSubscriptionView } from "src/sections/view/account-subscription-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

export default async function Page({ params }: PageProps) {
  const data = (await subscriptionQuery(params.locale).queryFn()).results;
  return <AccountSubscriptionView data={data} />;
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
