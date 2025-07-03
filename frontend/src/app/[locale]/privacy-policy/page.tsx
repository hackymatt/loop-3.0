import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { PrivacyPolicyView } from "src/sections/view/privacy-policy-view";

// ----------------------------------------------------------------------

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/privacy-policy.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.privacyPolicy : `/${LANGUAGE.EN}${paths.privacyPolicy}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
