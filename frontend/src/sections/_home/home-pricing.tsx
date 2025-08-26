import type { Variants } from "framer-motion";
import type { BoxProps } from "@mui/material/Box";
import type { Currency, IPlanProps, PlanInterval } from "src/types/plan";

import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSetState } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { CONFIG } from "src/global-config";
import { PLAN_INTERVAL } from "src/consts/plan";

import { varFade, MotionViewport } from "src/components/animate";

import { ArrowIcon } from "../pricing/arrow-icon";
import { PricingCard } from "../pricing/pricing-card";
import CurrencyToggle from "../pricing/currency-toogle";
import IntervalToggle from "../pricing/interval-toogle";

// ----------------------------------------------------------------------

const variants: Variants = varFade("inUp", { distance: 24 });

type HomePricingProps = {
  plans: IPlanProps[];
} & BoxProps;

export function HomePricing({ plans, sx, ...other }: HomePricingProps) {
  const { t } = useTranslation("pricing");
  const { t: home } = useTranslation("home");
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
    <Box
      component="section"
      sx={[{ pt: { xs: 10, md: 15 }, pb: { xs: 5, md: 10 } }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Container component={MotionViewport}>
        <Box sx={{ mx: "auto", maxWidth: 480, textAlign: "center", mb: { xs: 5, md: 10 } }}>
          <m.div variants={variants}>
            <Typography variant="overline" sx={{ color: "text.disabled" }}>
              {home("pricing.header")}
            </Typography>
          </m.div>

          <m.div variants={variants}>
            <Typography variant="h2" sx={{ my: 3 }}>
              {home("pricing.title")}
            </Typography>
          </m.div>

          <m.div variants={variants}>
            <Typography sx={{ color: "text.secondary" }}>{home("pricing.subtitle")}</Typography>
          </m.div>
        </Box>

        <m.div variants={variants}>{renderControls()}</m.div>

        <Box
          sx={{
            gap: 4,
            display: "grid",
            alignItems: "center",
            gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(3, 1fr)" },
          }}
        >
          {pricingCards.map((plan) => (
            <m.div key={plan.license}>
              <PricingCard
                key={plan.license}
                plan={plan}
                interval={setting.state.interval}
                currency={setting.state.currency}
              />
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
