import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { ContactView } from "src/sections/view/contact-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <ContactView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/contact.json`);

  const path = params.locale === LANGUAGE.PL ? paths.contact : `/${LANGUAGE.EN}${paths.contact}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
