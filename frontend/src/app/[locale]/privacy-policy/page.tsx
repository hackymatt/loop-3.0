import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { PrivacyPolicyView } from "src/sections/view/privacy-policy-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/privacy-policy.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.privacyPolicy : `/${LANGUAGE.EN}${paths.privacyPolicy}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
