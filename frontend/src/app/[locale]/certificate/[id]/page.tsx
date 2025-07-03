import type { Metadata } from "next";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { URLS } from "src/api/urls";
import { CONFIG } from "src/global-config";
import { LANGUAGE } from "src/consts/language";

import { CertificateView } from "src/sections/view/certificate-view";

// ----------------------------------------------------------------------
export default function Page({ params }: { params: { id: string } }) {
  return <CertificateView id={params.id} />;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const translations = await import(`public/locales/${params.locale}/certificate.json`);

  const path =
    params.locale === LANGUAGE.PL ? paths.certificate : `/${LANGUAGE.EN}${paths.certificate}`;

  try {
    const res = await fetch(`${CONFIG.api}${URLS.CERTIFICATES}/${params.id}`, {
      headers: { "Content-Type": "application/json", "Accept-Language": params.locale },
    });

    if (!res.ok) throw new Error("Failed to fetch certificate");

    const certificate = await res.json();

    const { student_name: studentName, course_name: courseName } = certificate;

    const title = translations.meta.certificate.title
      .replace("[studentName]", studentName)
      .replace("[courseName]", courseName);

    const description = translations.meta.certificate.description
      .replace("[studentName]", studentName)
      .replace("[courseName]", courseName);

    return createMetadata({ title, description, path: `${path}/${params.id}` });
  } catch {
    return createMetadata({
      title: translations.meta.certificate.title,
      description: translations.meta.certificate.description,
      path: `${path}/${params.id}`,
    });
  }
}
