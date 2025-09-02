import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import OrderStatusView from "src/sections/view/order-status";

// ----------------------------------------------------------------------

type SearchParams = { redirect_status: "succeeded" | "failed" };

type PageProps = {
  params: { locale: Language };
  searchParams: SearchParams;
};

export default async function Page({ searchParams }: PageProps) {
  return <OrderStatusView status={searchParams.redirect_status} />;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/order-status.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.orderStatus : `/${LANGUAGE.EN}${paths.orderStatus}`;

  return createMetadata({
    title: translations.meta[searchParams.redirect_status].title,
    description: translations.meta[searchParams.redirect_status].description,
    path,
  });
}
