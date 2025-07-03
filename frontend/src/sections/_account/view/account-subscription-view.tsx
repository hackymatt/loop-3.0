"use client";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import { Box, Card } from "@mui/material";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import { fDate } from "src/utils/format-time";
import { getPlanIcon } from "src/utils/plan-icon";
import { fCurrency } from "src/utils/format-number";

import { CONFIG } from "src/global-config";
import { usePlan } from "src/api/plan/plan";
import { PLAN_TYPE, PLAN_INTERVAL } from "src/consts/plan";
import { UpgradeButton } from "src/layouts/components/upgrade-button";

import { useUserContext } from "src/components/user";

import { CancelSubscriptionForm } from "./cancel-subscription-form";

// ----------------------------------------------------------------------

const iconPath = (name: string) => `${CONFIG.assetsDir}/assets/icons/plans/${name}`;
export function AccountSubscriptionView() {
  const { t } = useTranslation("account");
  const { t: locale } = useTranslation("locale");

  const cancelSubscriptionFormOpen = useBoolean();

  const user = useUserContext();
  const { plan: userPlan } = user.state;
  const isYearly = userPlan.interval === PLAN_INTERVAL.YEARLY;

  const { data: plan } = usePlan(userPlan.type || PLAN_TYPE.FREE);

  const isFreePlan = userPlan.type === PLAN_TYPE.FREE;

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t("subscription.title")}
      </Typography>

      <Card
        sx={{
          p: 5,
          maxWidth: 420,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        {/* Subscription Info */}
        <Box>
          <Typography variant="overline" sx={{ color: "text.disabled" }}>
            {t("subscription.label")}
          </Typography>

          <Box>
            <Box
              component="img"
              alt={plan?.license}
              src={iconPath(getPlanIcon(plan?.slug || PLAN_TYPE.FREE))}
              sx={{ width: 80, height: 80 }}
            />

            <Typography variant="h4" sx={{ mt: 1 }}>
              {plan?.license}
            </Typography>
          </Box>

          {isFreePlan && (
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              {t("subscription.sell")}
            </Typography>
          )}

          {!isFreePlan && (
            <Box
              sx={{
                mt: 2,
                color: "text.secondary",
                typography: "body2",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 0.5,
              }}
            >
              {t("subscription.billing.label")}
              <Typography variant="body2" fontWeight="bold">
                {isYearly ? t("subscription.billing.yearly") : t("subscription.billing.monthly")}
              </Typography>
            </Box>
          )}

          {!isFreePlan && (
            <Box
              sx={{
                mt: 2,
                color: "text.secondary",
                typography: "body2",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 0.5,
              }}
            >
              {t("subscription.renewal")}
              <Typography variant="body2" fontWeight="bold">
                {fCurrency(999, {
                  code: locale("code"),
                  currency: locale("currency"),
                })}
              </Typography>
              {t("subscription.on")}
              <Typography variant="body2" fontWeight="bold">
                {fDate(userPlan.valid_to)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 2,
            gap: 1,
          }}
        >
          <UpgradeButton
            slotProps={{
              button: {
                size: "large",
                sx: { width: { xs: 200, md: 300 } },
              },
            }}
          />
          {!isFreePlan && (
            <LoadingButton
              variant="text"
              size="large"
              color="error"
              onClick={cancelSubscriptionFormOpen.onToggle}
            >
              {t("subscription.button")}
            </LoadingButton>
          )}
        </Box>
      </Card>

      <CancelSubscriptionForm
        open={cancelSubscriptionFormOpen.value}
        onClose={cancelSubscriptionFormOpen.onFalse}
      />
    </>
  );
}
