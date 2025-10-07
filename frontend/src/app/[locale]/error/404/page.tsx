import type { Language } from "src/locales/types";

import { createMetadata } from "src/utils/create-metadata";

import { NotFoundView } from "src/sections/error/not-found-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

export default function Page() {
  return <NotFoundView />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/404.json`);

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path: "",
  });
}
