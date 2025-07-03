"use client";

import { SnackbarProvider as NotistackSnackbarProvider } from "notistack";

type Props = {
  children: React.ReactNode;
};

export default function SnackbarProvider({ children }: Props) {
  return (
    <NotistackSnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      autoHideDuration={3000}
      preventDuplicate
    >
      {children}
    </NotistackSnackbarProvider>
  );
}
