"use client";

import "dayjs/locale/pl";
import "dayjs/locale/en";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "./i18n";

import type { Language } from "./types";

type Props = {
  children: React.ReactNode;
  locale: Language;
};

export function TranslationProvider({ children, locale }: Props) {
  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
