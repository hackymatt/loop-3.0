import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { SupportView } from "src/sections/view/support-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <SupportView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/faq.json`);

  const path = params.locale === LANGUAGE.PL ? paths.support : `/${LANGUAGE.EN}${paths.support}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
