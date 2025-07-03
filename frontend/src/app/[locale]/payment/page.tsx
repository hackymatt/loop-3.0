import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { PaymentView } from "src/sections/payment/view/payment-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <PaymentView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/payment.json`);

  const path = params.locale === LANGUAGE.PL ? paths.payment : `/${LANGUAGE.EN}${paths.payment}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
