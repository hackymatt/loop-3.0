import type { BoxProps } from "@mui/material/Box";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import Collapse, { collapseClasses } from "@mui/material/Collapse";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { PLAN_TYPE } from "src/consts/plan";
import { useAnalytics } from "src/app/analytics-provider";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

import type { PricingCardProps } from "./types";

// ----------------------------------------------------------------------

type PricingColumnContentProps = BoxProps & {
  plan: PricingCardProps;
  isYearly: boolean;
};

export function PricingColumnContentMobile({
  plan,
  isYearly,
  sx,
  ...other
}: PricingColumnContentProps) {
  const { t } = useTranslation("pricing");
  const localize = useLocalizedPath();

  const user = useUserContext();
  const { isLoggedIn, plan: userPlan } = user.state;

  const isCurrentPlan = isLoggedIn && plan.slug === userPlan.type;

  const redirect = localize(
    plan.slug === PLAN_TYPE.FREE
      ? `${paths.payment}?plan=${plan.slug}`
      : `${paths.payment}?plan=${plan.slug}&yearly=${isYearly}`
  );

  const { trackEvent } = useAnalytics();

  const openContent = useBoolean();

  const renderButton = () => (
    <Link
      variant="subtitle2"
      color={openContent.value ? "primary" : "inherit"}
      onClick={openContent.onToggle}
      sx={{ gap: 1, display: "flex", cursor: "pointer", alignItems: "center" }}
    >
      {openContent.value ? t("hide") : t("show")} {t("allFeatures")}
      <Iconify
        icon={openContent.value ? "solar:alt-arrow-up-outline" : "solar:alt-arrow-down-outline"}
      />
    </Link>
  );

  const renderList = () => (
    <Collapse
      in={openContent.value}
      sx={{
        [`& .${collapseClasses.wrapperInner}`]: {
          pt: 3,
          gap: 2,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {plan.options.map((option) => (
        <Box
          key={option.title}
          sx={{
            gap: 1.5,
            display: "flex",
            alignItems: "center",
            typography: "body2",
            ...(option.disabled && { color: "text.disabled" }),
          }}
        >
          <Iconify
            icon={option.disabled ? "eva:close-outline" : "eva:checkmark-fill"}
            sx={{ color: option.disabled ? "inherit" : "primary.main" }}
          />
          {option.title}
        </Box>
      ))}
    </Collapse>
  );

  return (
    <Box
      sx={[
        {
          px: 3,
          pb: 5,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <div>
        {renderButton()}
        {renderList()}
      </div>

      <Button
        fullWidth
        size="large"
        variant={isCurrentPlan ? "outlined" : "contained"}
        color={plan.popular ? "primary" : "inherit"}
        href={isLoggedIn ? redirect : localize(paths.register)}
        disabled={isCurrentPlan}
        onClick={() => {
          if (!isLoggedIn) {
            user.setField("redirect", redirect);
          }
          trackEvent({ category: "pricing", label: plan.license, action: "choosePlan" });
        }}
        sx={{ mt: 5 }}
      >
        {isCurrentPlan ? t("current") : `${t("choose")} ${plan.license}`}
      </Button>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function PricingColumnContentDesktop({
  plan,
  isYearly,
  sx,
  ...other
}: PricingColumnContentProps) {
  const { t } = useTranslation("pricing");
  const localize = useLocalizedPath();

  const user = useUserContext();
  const { isLoggedIn, plan: userPlan } = user.state;

  const isCurrentPlan = isLoggedIn && plan.slug === userPlan.type;

  const redirect = localize(
    plan.slug === PLAN_TYPE.FREE
      ? `${paths.payment}?plan=${plan.slug}`
      : `${paths.payment}?plan=${plan.slug}&yearly=${isYearly}`
  );

  const { trackEvent } = useAnalytics();

  return (
    <Box sx={sx} {...other}>
      {plan.options.map((item) => (
        <Box
          key={item.title}
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            height: "var(--row-height)",
            borderBottom: `solid 1px ${theme.vars.palette.divider}`,
            ...(plan.popular && { bgcolor: "background.neutral" }),
          })}
        >
          {item.disabled ? (
            "-"
          ) : (
            <Iconify width={24} icon="eva:checkmark-fill" sx={{ color: "primary.main" }} />
          )}
        </Box>
      ))}

      <Box
        sx={{
          py: 5,
          textAlign: "center",
          ...(plan.popular && {
            bgcolor: "background.neutral",
            borderRadius: "0 0 16px 16px",
          }),
        }}
      >
        <Button
          size="large"
          variant={isCurrentPlan ? "outlined" : "contained"}
          color={plan.popular ? "primary" : "inherit"}
          href={isLoggedIn ? redirect : paths.register}
          disabled={isCurrentPlan}
          onClick={() => {
            if (!isLoggedIn) {
              user.setField("redirect", redirect);
            }
            trackEvent({ category: "pricing", label: plan.license, action: "choosePlan" });
          }}
        >
          {isCurrentPlan ? t("current") : `${t("choose")} ${plan.license}`}
        </Button>
      </Box>
    </Box>
  );
}
