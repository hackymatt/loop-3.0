import type { Language } from "src/locales/types";

import { MainLayout } from "src/layouts/main";
import { getData } from "src/layouts/main/data";

import { AccountLayout } from "src/sections/_account/layout";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function Layout({ children, params }: Props) {
  const data = await getData(params.locale as Language);
  return (
    <MainLayout data={data}>
      <AccountLayout>{children}</AccountLayout>
    </MainLayout>
  );
}
