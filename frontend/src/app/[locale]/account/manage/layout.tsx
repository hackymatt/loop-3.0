import { MainLayout } from "src/layouts/main";

import { AccountLayout } from "src/sections/_account/layout";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <MainLayout>
      <AccountLayout>{children}</AccountLayout>
    </MainLayout>
  );
}
