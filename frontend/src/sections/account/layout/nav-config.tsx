"use client";

import { useTranslation } from "react-i18next";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

// ----------------------------------------------------------------------

export const useNavData = () => {
  const { t } = useTranslation("account");
  const localize = useLocalizedPath();
  const {
    state: { firstPurchase },
  } = useUserContext();

  const commonNav = [
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
      icon: <Iconify icon="carbon:change-catalog" />,
    },
  ];

  return firstPurchase
    ? commonNav
    : [
        ...commonNav,
        {
          title: t("payment.title"),
          path: localize(paths.account.payment),
          icon: <Iconify icon="solar:card-outline" />,
        },
        {
          title: t("invoices.title"),
          path: localize(paths.account.invoices),
          icon: <Iconify icon="solar:bill-list-outline" />,
        },
      ];
};
