"use client";

import type { Currency, IPlanProps, PlanInterval } from "src/types/plan";

import { useTranslation } from "react-i18next";
import { useSetState } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { CONFIG } from "src/global-config";
import { PLAN_INTERVAL } from "src/consts/plan";

import { ArrowIcon } from "./arrow-icon";
import { PricingCard } from "./pricing-card";
import CurrencyToggle from "./currency-toogle";
import IntervalToggle from "./interval-toogle";

// ----------------------------------------------------------------------

type PricingCardsViewProps = { plans: IPlanProps[] };

export function PricingCardsView({ plans }: PricingCardsViewProps) {
  const { t } = useTranslation("pricing");
  const { t: locale } = useTranslation("locale");

  const setting = useSetState<{ interval: PlanInterval; currency: Currency }>({
    interval: PLAN_INTERVAL.YEARLY,
    currency: locale("currency") as Currency,
  });

  const pricingCards = (plans || []).map(({ pricing, ...rest }: IPlanProps) => {
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
        flexDirection: { xs: "column-reverse", md: "row" },
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {renderCurrencyToggle()}
      {renderIntervalToggle()}
    </Box>
  );

  return (
    <Container sx={{ pb: 10, pt: { xs: 3, md: 5 } }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: "center" }}>
        {t("title.cards")}
      </Typography>
      <Typography sx={{ color: "text.secondary", textAlign: "center" }}>
        {t("subtitle.cards")}
      </Typography>
      {renderControls()}
      <Box
        sx={{
          gap: 4,
          display: "grid",
          alignItems: "center",
          gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(3, 1fr)" },
        }}
      >
        {pricingCards.map((plan) => (
          <PricingCard
            key={plan.license}
            plan={plan}
            interval={setting.state.interval}
            currency={setting.state.currency}
          />
        ))}
      </Box>
    </Container>
  );
}
