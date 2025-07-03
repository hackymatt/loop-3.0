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

import { PLAN_TYPE } from "src/consts/plan";

import { Label } from "src/components/label";
import { Iconify } from "src/components/iconify";

import { PaymentTerms } from "./payment-terms";

// ----------------------------------------------------------------------

type PaymentSummaryProps = BoxProps & { plan: IPlanProps };

export function PaymentSummary({ plan, sx, ...other }: PaymentSummaryProps) {
  const { t } = useTranslation("payment");
  const { t: pricing } = useTranslation("pricing");
  const { t: locale } = useTranslation("locale");

  const { query, handleChange } = useQueryParams();

  const { license, price: priceObj } = plan;

  const isYearly = (query?.yearly ?? "false") === "true";
  const price = isYearly ? priceObj.yearly / 12 : priceObj.monthly;

  const isFreePlan = plan.slug === PLAN_TYPE.FREE;

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
            label={fCurrency(priceObj.monthly * 12 - priceObj.yearly, {
              code: locale("code"),
              currency: locale("currency"),
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
        onChange={() => handleChange("yearly", String(!isYearly))}
        inputProps={{ id: "plan-switch", "aria-label": "Plan switch" }}
      />
    </Box>
  );

  const renderPrices = () => (
    <Box sx={{ gap: 1, display: "flex", justifyContent: "flex-end" }}>
      <Box component="span" sx={{ typography: "h2" }}>
        {fCurrency(price, { code: locale("code"), currency: locale("currency") })}
      </Box>

      <Typography component="span" sx={{ mb: 1, alignSelf: "center", color: "text.secondary" }}>
        /{pricing("monthlyShort")}
      </Typography>
    </Box>
  );

  const renderTotalBilled = () => (
    <Box sx={{ display: "flex", alignItems: "center", typography: "h6" }}>
      <Box component="span" sx={{ flexGrow: 1 }}>
        {t("summary.total")}
      </Box>
      <Box component="span">
        {fCurrency(isYearly ? priceObj.yearly : priceObj.monthly, {
          code: locale("code"),
          currency: locale("currency"),
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
