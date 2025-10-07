import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { dataQuery } from "src/api/me/personal";
import { paymentMethodsQuery } from "src/api/me/payment-methods";

import { AccountPaymentView } from "src/sections/view/account-payment-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

const queries = {
  paymentMethods: (lang: Language) => paymentMethodsQuery(lang, { page_size: "-1" }),
  personal: (lang: Language) => dataQuery(lang),
};

async function getData(language: Language) {
  const paymentMethodsPromise = queries.paymentMethods(language).queryFn();
  const personalPromise = queries.personal(language).queryFn();

  const [paymentMethods, personal] = await Promise.all([paymentMethodsPromise, personalPromise]);

  return {
    paymentMethods: paymentMethods.results,
    personal: personal.results,
  };
}

export default async function Page({ params }: PageProps) {
  const data = await getData(params.locale);
  return <AccountPaymentView data={data} language={params.locale} />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/account.json`);

  const path =
    params.locale === LANGUAGE.PL
      ? paths.account.payment
      : `/${LANGUAGE.EN}${paths.account.payment}`;

  return createMetadata({
    title: translations.meta.payment.title,
    description: translations.meta.payment.description,
    path,
  });
}
