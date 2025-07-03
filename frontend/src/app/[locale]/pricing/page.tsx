import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { PricingView } from "src/sections/view/pricing-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <PricingView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/pricing.json`);

  const path = params.locale === LANGUAGE.PL ? paths.pricing : `/${LANGUAGE.EN}${paths.pricing}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
