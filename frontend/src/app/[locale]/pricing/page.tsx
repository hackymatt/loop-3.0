import type { IPlanProps } from "src/types/plan";
import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { plansQuery } from "src/api/plan/plans";

import { PricingView } from "src/sections/view/pricing-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

const queries = {
  plans: plansQuery,
};

async function getData(language: Language) {
  const entries = await Promise.all(
    Object.entries(queries).map(async ([key, queryFnBuilder]) => {
      const { queryFn } = queryFnBuilder(language);
      const { results } = await queryFn();
      return [key, results] as const;
    })
  );

  return Object.fromEntries(entries) as {
    plans: IPlanProps[];
  };
}

export default async function Page({ params }: PageProps) {
  const data = await getData(params.locale);
  return <PricingView data={data} />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/pricing.json`);

  const path = params.locale === LANGUAGE.PL ? paths.pricing : `/${LANGUAGE.EN}${paths.pricing}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
