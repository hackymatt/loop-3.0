import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import OrderCompletedView from "src/sections/view/order-completed";

// ----------------------------------------------------------------------

type PageProps = {
  params: { locale: Language };
};

export default async function Page() {
  return <OrderCompletedView />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/order-completed.json`);

  const path =
    params.locale === LANGUAGE.PL
      ? paths.order.completed
      : `/${LANGUAGE.EN}${paths.order.completed}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
