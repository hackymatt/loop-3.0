import type { IPlanProps } from "src/types/plan";
import type { BoxProps } from "@mui/material/Box";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { Chip, Link } from "@mui/material";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import { paths } from "src/routes/paths";

import { useQueryParams } from "src/hooks/use-query-params";

import { fCurrency } from "src/utils/format-number";
import { fAdd, fDate } from "src/utils/format-time";

import { CONFIG } from "src/global-config";
import { PLAN_TYPE, PLAN_INTERVAL } from "src/consts/plan";

import { Label } from "src/components/label";
import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

import { PaymentTerms } from "./payment-terms";

// ----------------------------------------------------------------------

type PaymentSummaryProps = BoxProps & { plan: IPlanProps };

export function PaymentSummary({ plan, sx, ...other }: PaymentSummaryProps) {
  const { t } = useTranslation("payment");
  const { t: pricing } = useTranslation("pricing");
  const { t: locale } = useTranslation("locale");

  const {
    state: { trialUsed },
  } = useUserContext();

  const { query, handleChange } = useQueryParams();

  const { license, pricing: pricingObj } = plan;

  const interval = query?.interval ?? PLAN_INTERVAL.YEARLY;
  const currency = query?.currency ?? locale("currency");

  const isYearly = interval === PLAN_INTERVAL.YEARLY;

  const priceObj = pricingObj.find((p) => p.currency === currency && p.interval === interval)!;
  const monthlyPriceObj = pricingObj.find(
    (p) => p.currency === currency && p.interval === PLAN_INTERVAL.MONTHLY
  )!;
  const yearlyPriceObj = pricingObj.find(
    (p) => p.currency === currency && p.interval === PLAN_INTERVAL.YEARLY
  )!;

  const isFreePlan = plan.type === PLAN_TYPE.FREE;

  const renderSubscription = () => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Typography variant="body2" sx={{ flexGrow: 1, color: "text.secondary" }}>
        {t("summary.plan")}
      </Typography>
      <Label color="error" sx={{ textTransform: "uppercase" }}>
        {license}
      </Label>
    </Box>
  );

  const renderPlanSwitch = () => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box
        sx={{
          typography: "body2",
          flexGrow: 1,
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          flexWrap: "wrap",
        }}
      >
        {t("summary.yearly.save")}
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <Chip
            label={fCurrency(monthlyPriceObj.price * 12 - yearlyPriceObj.price, {
              code: locale("code"),
              currency,
            })}
            size="small"
            color="primary"
            sx={{
              height: 20,
              fontSize: 12,
              "& .MuiChip-label": {
                paddingTop: 0,
                paddingBottom: 0,
                lineHeight: 20,
              },
            }}
          />
          {t("summary.yearly.part1")}
        </Box>
        {t("summary.yearly.part2")}
      </Box>

      <Switch
        checked={isYearly}
        onChange={() =>
          handleChange("interval", isYearly ? PLAN_INTERVAL.MONTHLY : PLAN_INTERVAL.YEARLY)
        }
        inputProps={{ id: "plan-switch", "aria-label": "Plan switch" }}
      />
    </Box>
  );

  const renderPrices = () => (
    <Box sx={{ gap: 1, display: "flex", justifyContent: "flex-end" }}>
      <Box component="span" sx={{ typography: "h2" }}>
        {fCurrency(priceObj.price, { code: locale("code"), currency })}
      </Box>

      <Typography component="span" sx={{ mb: 1, alignSelf: "center", color: "text.secondary" }}>
        /{pricing(`${interval}Short`)}
      </Typography>
    </Box>
  );

  const renderTotalDue = () => (
    <Box sx={{ display: "flex", alignItems: "center", typography: "h6" }}>
      <Box component="span" sx={{ flexGrow: 1 }}>
        {t("summary.due")}{" "}
        <Typography variant="body2" color="primary">
          ({fDate(fAdd({ days: CONFIG.trialDays }))})
        </Typography>
      </Box>
      <Box component="span">
        {fCurrency(priceObj.price, {
          code: locale("code"),
          currency,
        })}
      </Box>
    </Box>
  );

  const renderTotalBilled = () => (
    <Box sx={{ display: "flex", alignItems: "center", typography: "h6" }}>
      <Box component="span" sx={{ flexGrow: 1 }}>
        {t("summary.total")}{" "}
        {!trialUsed && (
          <Typography variant="body2" color="primary">
            {t("summary.trial", { days: CONFIG.trialDays })}
          </Typography>
        )}
      </Box>

      <Box component="span">
        {fCurrency(!trialUsed ? 0 : priceObj.price, {
          code: locale("code"),
          currency,
        })}
      </Box>
    </Box>
  );

  const renderPaymentNotice = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography
        variant="caption"
        sx={{ display: "block", textAlign: "center", color: "text.disabled" }}
      >
        {t("summary.info")}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{ display: "block", textAlign: "center", color: "text.disabled" }}
        >
          {t("summary.stripe.managed")}
        </Typography>
        <Iconify
          icon="logos:stripe"
          width={28}
          sx={{
            filter: "grayscale(100%)",
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Link
          target="_blank"
          rel="noopener"
          variant="caption"
          href={paths.stripe.termsOfService}
          color="text.primary"
          underline="none"
          sx={{ color: "text.secondary" }}
        >
          {t("summary.stripe.terms")}
        </Link>

        <Link
          target="_blank"
          rel="noopener"
          variant="caption"
          href={paths.stripe.privacyPolicy}
          color="text.primary"
          underline="none"
          sx={{ color: "text.secondary" }}
        >
          {t("summary.stripe.privacy")}
        </Link>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={[
        { p: 5, borderRadius: 2, bgcolor: "background.neutral" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography component="h6" variant="h5" sx={{ mb: { xs: 3, md: 5 } }}>
        {t("summary.label")}
      </Typography>

      <Box sx={{ gap: 2.5, display: "flex", flexDirection: "column" }}>
        {renderSubscription()}
        {!isFreePlan && renderPlanSwitch()}
        {renderPrices()}
        <Divider sx={{ borderStyle: "dashed" }} />
        {!trialUsed && renderTotalDue()}
        {renderTotalBilled()}
        <Divider sx={{ borderStyle: "dashed" }} />
      </Box>

      <PaymentTerms />

      <LoadingButton
        fullWidth
        size="large"
        color="inherit"
        type="submit"
        variant="contained"
        sx={{ my: 3 }}
      >
        {isFreePlan ? t("summary.button.free") : t("summary.button.other")}
      </LoadingButton>

      {!isFreePlan && renderPaymentNotice()}
    </Box>
  );
}
