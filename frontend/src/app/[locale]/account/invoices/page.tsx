import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { invoiceQuery } from "src/api/me/invoices";

import { AccountInvoicesView } from "src/sections/view/account-invoices-view";

// ----------------------------------------------------------------------
type SearchParams = Record<string, string>;

type PageProps = {
  params: { locale: Language };
  searchParams: SearchParams;
};

const queries = {
  invoices: (lang: Language, searchParams: SearchParams) => invoiceQuery(lang, searchParams),
};

async function getData(language: Language, searchParams: SearchParams) {
  const invoicesPromise = queries.invoices(language, searchParams).queryFn();

  const [invoices] = await Promise.all([invoicesPromise]);

  return {
    invoices: invoices.results,
    invoicesCount: invoices.count,
    invoicesPageSize: invoices.pagesCount,
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const data = await getData(params.locale, searchParams);
  return <AccountInvoicesView data={data} />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/account.json`);

  const path =
    params.locale === LANGUAGE.PL
      ? paths.account.invoices
      : `/${LANGUAGE.EN}${paths.account.invoices}`;

  return createMetadata({
    title: translations.meta.invoices.title,
    description: translations.meta.invoices.description,
    path,
  });
}
