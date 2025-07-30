import { useParams } from "next/navigation";

import { LANGUAGE } from "src/consts/language";

export function useLocalizedPath() {
  const { locale } = useParams() as { locale: string };
  return (path: string) => (locale === LANGUAGE.PL ? path : `/${locale}${path}`);
}
