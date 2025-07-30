import pluralize from "pluralize";
import { polishPlurals } from "polish-plurals";
import { useTranslation } from "react-i18next";

import { LANGUAGE } from "src/consts/language";

export function usePluralize() {
  const { t: locale } = useTranslation("locale");
  const language = locale("language");

  const languagePluralize = (wordVariants: string[], number: number) =>
    language === LANGUAGE.PL
      ? polishPlurals(wordVariants[0], wordVariants[1], wordVariants[2], number)
      : pluralize(wordVariants[0], number);

  return languagePluralize;
}
