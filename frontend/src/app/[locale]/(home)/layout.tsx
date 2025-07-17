import type { ReactNode } from "react";
import type { Language } from "src/locales/types";

import { MainLayout } from "src/layouts/main";
import { getData } from "src/layouts/main/data";

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function Layout({ children, params }: Props) {
  const data = await getData(params.locale as Language);

  return (
    <MainLayout
      data={data}
      slotProps={{
        header: {
          sx: { position: { md: "fixed" } },
        },
      }}
    >
      {children}
    </MainLayout>
  );
}
