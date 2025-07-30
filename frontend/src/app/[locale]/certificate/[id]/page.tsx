import type { Metadata } from "next";
import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { certificateQuery } from "src/api/certificate/certificate";

import { NotFoundView } from "src/sections/error/not-found-view";
import { CertificateView } from "src/sections/view/certificate-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language; id: string };
};

const queries = {
  certificate: (lang: Language, id: string) => certificateQuery(lang, id),
};

async function getData(language: Language, id: string) {
  try {
    const certificatePromise = queries.certificate(language, id).queryFn();

    const [certificate] = await Promise.all([certificatePromise]);

    return {
      certificate: certificate.results,
    };
  } catch {
    return null;
  }
}
export default async function Page({ params }: PageProps) {
  const data = await getData(params.locale, params.id);

  if (!data) {
    return <NotFoundView />;
  }
  return <CertificateView data={data} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const translations = await import(`public/locales/${params.locale}/certificate.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.certificate : `/${LANGUAGE.EN}${paths.certificate}`;

  try {
    const certificate = (await queries.certificate(params.locale, params.id).queryFn()).results;

    const { studentName, projectName } = certificate;

    const title = translations.meta.certificate.title
      .replace("[studentName]", studentName)
      .replace("[projectName]", projectName);

    const description = translations.meta.certificate.description
      .replace("[studentName]", studentName)
      .replace("[projectName]", projectName);

    return createMetadata({ title, description, path: `${path}/${params.id}` });
  } catch {
    return createMetadata({
      title: translations.meta.certificate.title,
      description: translations.meta.certificate.description,
      path: `${path}/${params.id}`,
    });
  }
}
