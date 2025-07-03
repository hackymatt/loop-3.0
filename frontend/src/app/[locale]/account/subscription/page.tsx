import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { AccountSubscriptionView } from "src/sections/_account/view/account-subscription-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <AccountSubscriptionView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
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
