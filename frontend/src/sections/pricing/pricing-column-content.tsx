import type { BoxProps } from "@mui/material/Box";
import type { Currency, PlanInterval } from "src/types/plan";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import LoadingButton from "@mui/lab/LoadingButton";
import Collapse, { collapseClasses } from "@mui/material/Collapse";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { fShortenNumber } from "src/utils/format-number";

import { PLAN_TYPE } from "src/consts/plan";
import { useAnalytics } from "src/app/analytics-provider";
import { useCreateCustomerPortalLink } from "src/api/me/customer-portal-link";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

import type { PricingCardProps } from "./types";

// ----------------------------------------------------------------------

type PricingColumnContentProps = BoxProps & {
  plan: PricingCardProps;
  interval: PlanInterval;
  currency: Currency;
};

export function PricingColumnContentMobile({
  plan,
  interval,
  currency,
  sx,
  ...other
}: PricingColumnContentProps) {
  const { t } = useTranslation("pricing");
  const { t: locale } = useTranslation("locale");
  const localize = useLocalizedPath();
  const router = useRouter();

  const { mutateAsync: createCustomerPortalLink, isLoading } = useCreateCustomerPortalLink();

  const user = useUserContext();
  const { isLoggedIn, planType } = user.state;

  const isCurrentPlan = isLoggedIn && plan.type === planType;
  const isFreePlan = planType === PLAN_TYPE.FREE;

  const handleRedirect = async () => {
    if (!isLoggedIn) {
      if (plan.type === PLAN_TYPE.FREE) {
        user.setField("redirect", localize(paths.account.dashboard));
      } else {
        user.setField(
          "redirect",
          localize(`${paths.payment}/${plan.type}?interval=${interval}&currency=${currency}`)
        );
      }
      router.push(localize(paths.account.dashboard));
      return;
    }

    if (isFreePlan) {
      router.push(
        localize(`${paths.payment}/${plan.type}?interval=${interval}&currency=${currency}`)
      );
      return;
    }

    const {
      data: { url },
    } = await createCustomerPortalLink({});
    router.push(url);
  };

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
      <Box
        sx={{
          gap: 1.5,
          display: "flex",
          alignItems: "center",
          typography: "body2",
        }}
      >
        <Iconify icon="logos:openai-icon" />
        {fShortenNumber(plan.tokensLimit, { code: locale("code") })} {t("token")}
      </Box>
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

      <LoadingButton
        fullWidth
        size="large"
        variant={isCurrentPlan ? "outlined" : "contained"}
        color={plan.popular ? "primary" : "inherit"}
        disabled={isCurrentPlan && isFreePlan}
        loading={isLoading}
        onClick={async () => {
          trackEvent({ category: "pricing", label: plan.license, action: "choosePlan" });
          await handleRedirect();
        }}
        sx={{ mt: 5 }}
      >
        {isCurrentPlan && isFreePlan
          ? t("current")
          : isCurrentPlan && !isFreePlan
            ? t("manage")
            : `${t("choose")} ${plan.license}`}
      </LoadingButton>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function PricingColumnContentDesktop({
  plan,
  interval,
  currency,
  sx,
  ...other
}: PricingColumnContentProps) {
  const { t } = useTranslation("pricing");
  const { t: locale } = useTranslation("locale");
  const localize = useLocalizedPath();
  const router = useRouter();

  const { mutateAsync: createCustomerPortalLink, isLoading } = useCreateCustomerPortalLink();

  const user = useUserContext();
  const { isLoggedIn, planType } = user.state;

  const isCurrentPlan = isLoggedIn && plan.type === planType;
  const isFreePlan = planType === PLAN_TYPE.FREE;

  const handleRedirect = async () => {
    if (!isLoggedIn) {
      if (plan.type === PLAN_TYPE.FREE) {
        user.setField("redirect", localize(paths.account.dashboard));
      } else {
        user.setField(
          "redirect",
          localize(`${paths.payment}/${plan.type}?interval=${interval}&currency=${currency}`)
        );
      }
      router.push(localize(paths.account.dashboard));
      return;
    }

    if (isFreePlan) {
      router.push(
        localize(`${paths.payment}/${plan.type}?interval=${interval}&currency=${currency}`)
      );
      return;
    }

    const {
      data: { url },
    } = await createCustomerPortalLink({});
    router.push(url);
  };

  const { trackEvent } = useAnalytics();

  return (
    <Box sx={sx} {...other}>
      <Box
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
        {fShortenNumber(plan.tokensLimit, { code: locale("code") })}
      </Box>
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
        <LoadingButton
          size="large"
          variant={isCurrentPlan ? "outlined" : "contained"}
          color={plan.popular ? "primary" : "inherit"}
          disabled={isCurrentPlan && isFreePlan}
          loading={isLoading}
          onClick={async () => {
            trackEvent({ category: "pricing", label: plan.license, action: "choosePlan" });
            await handleRedirect();
          }}
        >
          {isCurrentPlan && isFreePlan
            ? t("current")
            : isCurrentPlan && !isFreePlan
              ? t("manage")
              : `${t("choose")} ${plan.license}`}
        </LoadingButton>
      </Box>
    </Box>
  );
}
