import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { TermsOfServiceView } from "src/sections/view/terms-of-service-view";

// ----------------------------------------------------------------------

export default function TermsOfServicePage() {
  return <TermsOfServiceView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/terms-of-service.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.termsOfService : `/${LANGUAGE.EN}${paths.termsOfService}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
