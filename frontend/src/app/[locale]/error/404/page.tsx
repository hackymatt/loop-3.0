import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { NotFoundView } from "src/sections/error/not-found-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <NotFoundView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/404.json`);

  const path = params.locale === LANGUAGE.PL ? paths.page404 : `/${LANGUAGE.EN}${paths.page404}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
