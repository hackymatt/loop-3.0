"use client";

import type { Currency, IPlanProps, PlanInterval } from "src/types/plan";

import { useTranslation } from "react-i18next";
import { useSetState } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { CONFIG } from "src/global-config";
import { PLAN_INTERVAL } from "src/consts/plan";

import { ArrowIcon } from "./arrow-icon";
import CurrencyToggle from "./currency-toogle";
import IntervalToggle from "./interval-toogle";
import { PricingColumnHeader } from "./pricing-column-header";
import { PricingColumnContentMobile, PricingColumnContentDesktop } from "./pricing-column-content";

// ----------------------------------------------------------------------
type PricingColumnsViewProps = { plans: IPlanProps[] };

export function PricingColumnsView({ plans }: PricingColumnsViewProps) {
  const { t } = useTranslation("pricing");
  const { t: locale } = useTranslation("locale");

  const setting = useSetState<{ interval: PlanInterval; currency: Currency }>({
    interval: PLAN_INTERVAL.YEARLY,
    currency: locale("currency") as Currency,
  });

  const pricingColumns = (plans || []).map(({ pricing, ...rest }: IPlanProps) => {
    const priceObj = pricing.find(
      (p) => p.currency === setting.state.currency && p.interval === setting.state.interval
    )!;
    return {
      ...rest,
      price: setting.state.interval === PLAN_INTERVAL.YEARLY ? priceObj.price / 12 : priceObj.price,
    };
  });

  const renderIntervalToggle = () => (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <IntervalToggle
        value={setting.state.interval}
        onChange={(newInterval) => setting.setField("interval", newInterval)}
      />

      <Box sx={{ position: "relative" }}>
        <Box sx={{ display: "flex", position: "absolute", left: -56, bottom: 24 }}>
          <ArrowIcon />
          <Box
            component="span"
            sx={{ whiteSpace: "nowrap", color: "success.main", typography: "overline" }}
          >
            {t("save")} {CONFIG.annualDiscount}%
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const renderCurrencyToggle = () => (
    <CurrencyToggle
      value={setting.state.currency}
      onChange={(newCurrency) => setting.setField("currency", newCurrency)}
    />
  );

  const renderControls = () => (
    <Box
      sx={{
        mt: 9,
        mb: 5,
        gap: 2,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {renderIntervalToggle()}
      {renderCurrencyToggle()}
    </Box>
  );

  const renderDesktop = () => (
    <Grid container sx={{ "--row-height": "80px", display: { xs: "none", md: "flex" } }}>
      <Grid
        size={{ xs: 12, md: 3 }}
        sx={(theme) => ({ borderTop: `solid 1px ${theme.vars.palette.divider}` })}
      >
        <Box
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            height: "var(--row-height)",
            borderBottom: `solid 1px ${theme.vars.palette.divider}`,
          })}
        >
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            {t("tokenLimit")}
          </Typography>
        </Box>
        {(pricingColumns[0]?.options || []).map((option) => (
          <Box
            key={option.title}
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              height: "var(--row-height)",
              borderBottom: `solid 1px ${theme.vars.palette.divider}`,
            })}
          >
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              {option.title}
            </Typography>
          </Box>
        ))}
      </Grid>

      {pricingColumns.map((plan) => (
        <Grid
          key={plan.license}
          size={{ xs: 12, md: 3 }}
          sx={(theme) => ({ borderTop: { md: `solid 1px ${theme.vars.palette.divider}` } })}
        >
          <PricingColumnContentDesktop
            plan={plan}
            interval={setting.state.interval}
            currency={setting.state.currency}
          />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container sx={{ pb: 10, pt: { xs: 3, md: 5 } }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: "center" }}>
        {t("title.columns")}
      </Typography>

      <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
        {t("subtitle.columns")}
      </Typography>

      {renderControls()}

      <Grid container sx={{ alignItems: "flex-end" }}>
        <Grid sx={{ pb: 5, display: { xs: "none", md: "block " } }} size={{ xs: 12, md: 3 }}>
          <Typography variant="overline" sx={{ color: "primary.main" }}>
            {t("feature")}
          </Typography>
        </Grid>

        {pricingColumns.map((plan) => (
          <Grid
            key={plan.license}
            sx={(theme) => ({
              mb: 4,
              borderRadius: 2,
              boxShadow: theme.vars.customShadows.z16,
              [theme.breakpoints.up("md")]: { mb: 0, boxShadow: 0, borderRadius: 0 },
            })}
            size={{ xs: 12, md: 3 }}
          >
            <PricingColumnHeader plan={plan} currency={setting.state.currency} />
            <PricingColumnContentMobile
              plan={plan}
              interval={setting.state.interval}
              currency={setting.state.currency}
              sx={{ display: { md: "none" } }}
            />
          </Grid>
        ))}
      </Grid>
      {renderDesktop()}
    </Container>
  );
}
