import type { Language } from "src/locales/types";

import { LANGUAGE } from "src/consts/language";

export const langs = [
  { value: LANGUAGE.PL, label: "Polski", countryCode: "PL" },
  { value: LANGUAGE.EN as Language, label: "English", countryCode: "GB" },
];
