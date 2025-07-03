import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { DashboardView } from "src/sections/view/dashboard-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <DashboardView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/dashboard.json`);

  const path =
    params.locale === LANGUAGE.PL
      ? paths.account.dashboard
      : `/${LANGUAGE.EN}${paths.account.dashboard}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
