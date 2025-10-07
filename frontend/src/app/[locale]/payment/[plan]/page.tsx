import type { Language } from "src/locales/types";

import { redirect } from "next/navigation";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { PLAN_TYPE } from "src/consts/plan";
import { planQuery } from "src/api/plan/plan";
import { LANGUAGE } from "src/consts/language";
import { dataQuery } from "src/api/me/personal";
import { createSetupIntent } from "src/api/plan/payment";

import { PaymentView } from "src/sections/view/payment-view";
import { NotFoundView } from "src/sections/error/not-found-view";

// ----------------------------------------------------------------------

type PageProps = {
  params: { locale: Language; plan: string };
};

const queries = {
  plan: (lang: Language, type: string) => planQuery(lang, type),
  personal: (lang: Language) => dataQuery(lang),
  setupIntent: (lang: Language) => createSetupIntent(lang),
};

async function getData(language: Language, type: string) {
  const planPromise = queries.plan(language, type).queryFn();
  const personalPromise = queries.personal(language).queryFn();
  const createSetupIntentPromise = queries.setupIntent(language);
  const [plan, personal, setupIntent] = await Promise.all([
    planPromise,
    personalPromise,
    createSetupIntentPromise,
  ]);

  return {
    plan: plan.results,
    personal: personal.results,
    clientSecret: setupIntent.client_secret,
    customerSessionClientSecret: setupIntent.customer_session_client_secret,
  };
}
export default async function Page({ params }: PageProps) {
  if (
    ![PLAN_TYPE.BASIC, PLAN_TYPE.PREMIUM].includes(
      params.plan as typeof PLAN_TYPE.BASIC | typeof PLAN_TYPE.PREMIUM
    )
  ) {
    return <NotFoundView />;
  }

  try {
    const data = await getData(params.locale, params.plan);
    return <PaymentView data={data} language={params.locale} />;
  } catch {
    return redirect(paths.account.dashboard);
  }
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
