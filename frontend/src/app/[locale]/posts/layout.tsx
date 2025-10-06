import type { Language } from "src/locales/types";

import { MainLayout } from "src/layouts/main";
import { getData } from "src/layouts/main/data";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  params: { locale: Language };
};

export default async function Layout({ children, params }: Props) {
  const data = await getData(params.locale as Language);
  return (
    <MainLayout data={data} language={params.locale}>
      {children}
    </MainLayout>
  );
}
