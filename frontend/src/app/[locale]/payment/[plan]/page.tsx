import type { Language } from "src/locales/types";
import type { Currency, PlanInterval } from "src/types/plan";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { planQuery } from "src/api/plan/plan";
import { LANGUAGE } from "src/consts/language";
import { createSetupIntent } from "src/api/plan/payment";

import { PaymentView } from "src/sections/view/payment-view";

// ----------------------------------------------------------------------
type SearchParams = { interval: PlanInterval; currency: Currency };

type PageProps = {
  params: { locale: Language; plan: string };
  searchParams: SearchParams;
};

const queries = {
  plan: (lang: Language, type: string) => planQuery(lang, type),
  setupIntent: ({
    type,
    interval,
    currency,
  }: {
    type: string;
    interval: string;
    currency: string;
  }) => createSetupIntent({ type, interval, currency }),
};

async function getData(language: Language, type: string, interval: string, currency: string) {
  const planPromise = queries.plan(language, type).queryFn();
  const createSubscriptionPromise = queries.setupIntent({
    type,
    interval,
    currency,
  });

  const [plan, subscription] = await Promise.all([planPromise, createSubscriptionPromise]);

  return {
    plan: plan.results,
    clientSecret: subscription.client_secret,
  };
}
export default async function Page({ params, searchParams }: PageProps) {
  const data = await getData(
    params.locale,
    params.plan,
    searchParams.interval,
    searchParams.currency
  );
  return <PaymentView data={data} language={params.locale} />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/payment.json`);

  const path = params.locale === LANGUAGE.PL ? paths.payment : `/${LANGUAGE.EN}${paths.payment}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
