import type { PaperProps } from "@mui/material/Paper";

import { useTranslation } from "react-i18next";
import { varAlpha } from "minimal-shared/utils";

import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { getPlanIcon } from "src/utils/plan-icon";
import { fCurrency } from "src/utils/format-number";

import { CONFIG } from "src/global-config";
import { PLAN_TYPE } from "src/consts/plan";
import { useAnalytics } from "src/app/analytics-provider";

import { Label } from "src/components/label";
import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

import type { PricingCardProps } from "./types";

// ----------------------------------------------------------------------

type Props = PaperProps & {
  plan: PricingCardProps;
  isYearly: boolean;
};

const iconPath = (name: string) => `${CONFIG.assetsDir}/assets/icons/plans/${name}`;

export function PricingCard({ plan, isYearly, sx, ...other }: Props) {
  const { t } = useTranslation("pricing");
  const { t: locale } = useTranslation("locale");
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

  const renderIcons = () => (
    <Box
      component="img"
      alt={plan.license}
      src={iconPath(getPlanIcon(plan.slug))}
      sx={{ width: 80, height: 80 }}
    />
  );

  const renderPrices = () => (
    <Box
      sx={{
        gap: 0.5,
        display: "flex",
        alignItems: "center",
        ...(plan.popular && { color: "primary.main" }),
      }}
    >
      <Typography component="span" variant="h3">
        {fCurrency(plan.price, { code: locale("code"), currency: locale("currency") })}
      </Typography>

      <Typography component="span" variant="subtitle2">
        /{t("monthlyShort")}
      </Typography>
    </Box>
  );

  const renderList = () => (
    <Box
      sx={{
        gap: 1,
        display: "flex",
        typography: "body2",
        textAlign: "left",
        flexDirection: "column",
      }}
    >
      {plan.options.map((option) => (
        <Box
          key={option.title}
          sx={{
            gap: 1.5,
            display: "flex",
            alignItems: "center",
            ...(option.disabled && { color: "text.disabled" }),
          }}
        >
          <Iconify
            width={20}
            icon={option.disabled ? "eva:close-outline" : "eva:checkmark-fill"}
            sx={{ color: "primary.main", ...(option.disabled && { color: "text.disabled" }) }}
          />
          {option.title}
        </Box>
      ))}
    </Box>
  );

  return (
    <Paper
      variant="outlined"
      sx={[
        (theme) => ({
          p: 5,
          gap: 5,
          display: "flex",
          borderRadius: 2,
          position: "relative",
          alignItems: "center",
          bgcolor: "transparent",
          flexDirection: "column",
          boxShadow: theme.vars.customShadows.card,
          [theme.breakpoints.up("md")]: { boxShadow: "none" },
        }),
        (theme) =>
          plan.popular && {
            py: 8,
            [theme.breakpoints.up("md")]: {
              boxShadow: `-24px 24px 72px -8px ${varAlpha(theme.vars.palette.grey["500Channel"], 0.24)}`,
              ...theme.applyStyles("dark", {
                boxShadow: `-24px 24px 72px -8px ${varAlpha(theme.vars.palette.common.blackChannel, 0.24)}`,
              }),
            },
          },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {plan.popular && (
        <Label color="info" sx={{ position: "absolute", top: 16, right: 16 }}>
          {t("popular")}
        </Label>
      )}

      <Box component="span" sx={{ color: "text.secondary", typography: "overline" }}>
        {plan.license}
      </Box>

      {renderIcons()}
      {renderPrices()}
      {renderList()}

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
      >
        {isCurrentPlan ? t("current") : `${t("choose")} ${plan.license}`}
      </Button>
    </Paper>
  );
}
