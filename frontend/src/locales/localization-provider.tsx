"use client";

import "dayjs/locale/pl";
import "dayjs/locale/en";

import dayjs from "dayjs";
import { useEffect } from "react";
import { useIsClient } from "minimal-shared/hooks";
import localizedFormat from "dayjs/plugin/localizedFormat";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider as MUIProvider } from "@mui/x-date-pickers/LocalizationProvider";

import type { Language } from "./types";

dayjs.extend(localizedFormat);

type Props = {
  children: React.ReactNode;
  locale: Language;
};

export function LocalizationProvider({ children, locale }: Props) {
  const isClient = useIsClient();

  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  if (!isClient) {
    return null;
  }

  return <MUIProvider dateAdapter={AdapterDayjs}>{children}</MUIProvider>;
}
