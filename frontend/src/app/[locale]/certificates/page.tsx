import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { CertificatesView } from "src/sections/view/certificates-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <CertificatesView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/certificate.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.certificates : `/${LANGUAGE.EN}${paths.certificates}`;

  return createMetadata({
    title: translations.meta.certificates.title,
    description: translations.meta.certificates.description,
    path,
  });
}
