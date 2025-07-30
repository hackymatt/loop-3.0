import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function useCookiesTypes() {
  const { t } = useTranslation("cookies");
  const cookies = useMemo(
    () => [
      {
        type: "mandatory",
        title: t("options.mandatory.title"),
        description: t("options.mandatory.description"),
        disabled: true,
      },
      {
        type: "analytics",
        title: t("options.analytics.title"),
        description: t("options.analytics.description"),
        disabled: false,
      },
      {
        type: "marketing",
        title: t("options.marketing.title"),
        description: t("options.marketing.description"),
        disabled: false,
      },
    ],
    [t]
  );

  const defaultCookies = useMemo(
    () =>
      cookies.reduce((acc: { [cookie: string]: boolean }, cookie) => {
        acc[cookie.type] = cookie.disabled;
        return acc;
      }, {}),
    [cookies]
  );

  return { cookies, defaultCookies };
}
