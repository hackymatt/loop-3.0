import type { BoxProps } from "@mui/material/Box";
import type { Currency, PlanInterval } from "src/types/plan";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { getPlanIcon } from "src/utils/plan-icon";
import { fCurrency } from "src/utils/format-number";

import { CONFIG } from "src/global-config";
import { PLAN_TYPE, PLAN_INTERVAL } from "src/consts/plan";

import { Label } from "src/components/label";

import type { PricingCardProps } from "./types";

// ----------------------------------------------------------------------

type PricingColumnHeaderProps = BoxProps & {
  plan: PricingCardProps;
  interval: PlanInterval;
  currency: Currency;
};

const iconPath = (name: string) => `${CONFIG.assetsDir}/assets/icons/plans/${name}`;

export function PricingColumnHeader({
  plan,
  interval,
  currency,
  sx,
  ...other
}: PricingColumnHeaderProps) {
  const { t } = useTranslation("pricing");
  const { t: locale } = useTranslation("locale");

  const renderIcons = () => (
    <Box
      component="img"
      alt={plan.license}
      src={iconPath(getPlanIcon(plan.type))}
      sx={{ width: 80, height: 80 }}
    />
  );

  const renderPrices = () => (
    <Box
      sx={{
        gap: 0.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...(plan.popular && { color: "primary.main" }),
      }}
    >
      <Typography component="span" variant="h3">
        {fCurrency(plan.price, { code: locale("code"), currency })}
      </Typography>

      <Typography component="span" variant="subtitle2">
        /{t("monthlyShort")}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={[
        {
          px: 3,
          py: 5,
          gap: 2,
          display: "flex",
          position: "relative",
          flexDirection: "column",
          alignItems: { xs: "flex-start", md: "center" },
        },
        plan.popular && {
          borderRadius: "16px 16px 0 0",
          bgcolor: { md: "background.neutral" },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 1 }}>
        {plan.popular && <Label color="info">{t("popular")}</Label>}
        {plan.type !== PLAN_TYPE.FREE && (
          <Label color="success">{t("trial", { days: CONFIG.trialDays })}</Label>
        )}
      </Box>

      <Typography variant="overline" sx={{ color: "text.secondary", mt: 2 }}>
        {plan.license}
      </Typography>

      {renderPrices()}
      {renderIcons()}

      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          visibility: interval === PLAN_INTERVAL.YEARLY ? "visible" : "hidden",
        }}
      >
        {fCurrency(plan.price * 12, { code: locale("code"), currency })} {t("perYear")}
      </Typography>
    </Box>
  );
}
