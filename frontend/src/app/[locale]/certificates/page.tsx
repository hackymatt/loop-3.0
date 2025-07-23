import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { certificatesQuery } from "src/api/certificate/certificates";

import { CertificatesView } from "src/sections/view/certificates-view";

// ----------------------------------------------------------------------
type SearchParams = Record<string, string>;

type PageProps = {
  params: { locale: Language };
  searchParams: SearchParams;
};

const queries = {
  certificates: (lang: Language, searchParams: SearchParams) =>
    certificatesQuery(lang, searchParams),
};

async function getData(language: Language, searchParams: SearchParams) {
  const certificatesPromise = queries.certificates(language, searchParams).queryFn();

  const [certificates] = await Promise.all([certificatesPromise]);

  return {
    certificates: certificates.results,
    certificatesCount: certificates.count,
    certificatesPageSize: certificates.pagesCount,
  };
}
export default async function Page({ params, searchParams }: PageProps) {
  const data = await getData(params.locale, searchParams);
  return <CertificatesView data={data} />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/certificate.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.certificates : `/${LANGUAGE.EN}${paths.certificates}`;

  return createMetadata({
    title: translations.meta.certificates.title,
    description: translations.meta.certificates.description,
    path,
  });
}
