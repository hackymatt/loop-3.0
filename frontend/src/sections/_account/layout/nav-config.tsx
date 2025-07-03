"use client";

import { useTranslation } from "react-i18next";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------

export const useNavData = () => {
  const { t } = useTranslation("account");
  const localize = useLocalizedPath();

  return [
    {
      title: t("personal.title"),
      path: localize(paths.account.personal),
      icon: <Iconify icon="solar:user-rounded-outline" />,
    },
    {
      title: t("manage.title"),
      path: localize(paths.account.manage),
      icon: <Iconify icon="solar:settings-outline" />,
    },
    {
      title: t("subscription.title"),
      path: localize(paths.account.subscription),
      icon: <Iconify icon="solar:card-outline" />,
    },
  ];
};
