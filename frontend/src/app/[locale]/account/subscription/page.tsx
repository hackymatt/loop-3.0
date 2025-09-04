import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { plansQuery } from "src/api/plan/plans";
import { subscriptionQuery } from "src/api/me/subscription";

import { AccountSubscriptionView } from "src/sections/view/account-subscription-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

const queries = {
  subscription: (lang: Language) => subscriptionQuery(lang),
  plans: (lang: Language) => plansQuery(lang),
};

async function getData(locale: Language) {
  const subscriptionPromise = queries.subscription(locale).queryFn();
  const plansPromise = queries.plans(locale).queryFn();

  const [subscription, plans] = await Promise.all([subscriptionPromise, plansPromise]);

  return {
    subscription: subscription.results,
    plans: plans.results,
  };
}

export default async function Page({ params }: PageProps) {
  const data = await getData(params.locale);
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
