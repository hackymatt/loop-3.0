import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { planQuery } from "src/api/plan/plan";
import { LANGUAGE } from "src/consts/language";

import { PaymentView } from "src/sections/view/payment-view";

// ----------------------------------------------------------------------

type PageProps = {
  params: { locale: Language; plan: string };
};

const queries = {
  plan: (lang: Language, type: string) => planQuery(lang, type),
};

async function getData(language: Language, type: string) {
  const planPromise = queries.plan(language, type).queryFn();

  const [plan] = await Promise.all([planPromise]);

  return {
    plan: plan.results,
  };
}
export default async function Page({ params }: PageProps) {
  const data = await getData(params.locale, params.plan);
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
