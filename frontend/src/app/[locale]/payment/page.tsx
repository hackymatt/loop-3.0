import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { planQuery } from "src/api/plan/plan";
import { LANGUAGE } from "src/consts/language";

import { PaymentView } from "src/sections/view/payment-view";

// ----------------------------------------------------------------------
type SearchParams = Record<string, string>;

type PageProps = {
  params: { locale: Language };
  searchParams: SearchParams;
};

const queries = {
  plan: (lang: Language, slug: string) => planQuery(lang, slug),
};

async function getData(language: Language, slug: string) {
  const planPromise = queries.plan(language, slug).queryFn();

  const [plan] = await Promise.all([planPromise]);

  return {
    plan: plan.results,
  };
}
export default async function Page({ params, searchParams }: PageProps) {
  const data = await getData(params.locale, searchParams.plan);
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
