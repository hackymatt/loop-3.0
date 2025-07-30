import { useTranslation } from "react-i18next";

import { Link, Typography } from "@mui/material";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

export const useTermsAcceptance = () => {
  const { t } = useTranslation("account");
  const localize = useLocalizedPath();

  return (
    <Typography variant="caption" align="left" sx={{ color: "text.secondary" }}>
      {t("termsAcceptance.label.accept")}{" "}
      <Link
        target="_blank"
        rel="noopener"
        href={localize(paths.termsOfService)}
        color="text.primary"
        underline="always"
      >
        {t("termsAcceptance.label.terms")}
      </Link>{" "}
      {t("termsAcceptance.label.and")}{" "}
      <Link
        target="_blank"
        rel="noopener"
        href={localize(paths.privacyPolicy)}
        color="text.primary"
        underline="always"
      >
        {t("termsAcceptance.label.privacy")}
      </Link>
    </Typography>
  );
};

export const useDataProcessingConsent = () => {
  const { t } = useTranslation("account");

  return (
    <Typography variant="caption" align="left" sx={{ color: "text.secondary" }}>
      {t("dataProcessingConsent.label")}
    </Typography>
  );
};

export const useMarketingConsent = () => {
  const { t } = useTranslation("newsletter");
  const localize = useLocalizedPath();

  return (
    <Typography variant="caption" align="left" sx={{ color: "text.secondary" }}>
      {t("marketingConsent.label.accept")}
      <Link
        target="_blank"
        rel="noopener"
        href={localize(paths.privacyPolicy)}
        color="text.secondary"
        underline="always"
      >
        {t("marketingConsent.label.link")}
      </Link>
      .
    </Typography>
  );
};
