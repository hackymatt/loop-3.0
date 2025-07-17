import type { Language } from "src/locales/types";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { dashboardQuery } from "src/api/me/dashboard";

import { DashboardView } from "src/sections/view/dashboard-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

export default async function Page({ params }: PageProps) {
  const data = (await dashboardQuery(params.locale).queryFn()).results;
  return <DashboardView data={data} />;
}

export async function generateMetadata({ params }: PageProps) {
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
