import type { Language } from "src/locales/types";
import type { SubscriptionResult } from "src/types/user";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import OrderStatusView from "src/sections/view/order-status-view";

// ----------------------------------------------------------------------

type SearchParams = { status: SubscriptionResult };

type PageProps = {
  params: { locale: Language };
  searchParams: SearchParams;
};

export default async function Page({ params, searchParams }: PageProps) {
  return <OrderStatusView status={searchParams.status} language={params.locale} />;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/order-status.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.orderStatus : `/${LANGUAGE.EN}${paths.orderStatus}`;

  return createMetadata({
    title: translations.meta[searchParams.status].title,
    description: translations.meta[searchParams.status].description,
    path,
  });
}
