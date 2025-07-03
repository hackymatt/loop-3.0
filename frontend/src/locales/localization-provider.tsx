"use client";

import "dayjs/locale/pl";
import "dayjs/locale/en";

import dayjs from "dayjs";
import { useEffect } from "react";
import { useIsClient } from "minimal-shared/hooks";
import localizedFormat from "dayjs/plugin/localizedFormat";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider as MUIProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { useSettingsContext } from "src/components/settings";

dayjs.extend(localizedFormat);

type Props = {
  children: React.ReactNode;
};

export function LocalizationProvider({ children }: Props) {
  const settings = useSettingsContext();
  const isClient = useIsClient();

  useEffect(() => {
    const { language } = settings.state;
    dayjs.locale(language);
  }, [settings.state]);

  if (!isClient) {
    return null;
  }

  return <MUIProvider dateAdapter={AdapterDayjs}>{children}</MUIProvider>;
}
