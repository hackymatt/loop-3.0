"use client";

import type { Language } from "src/locales/types";
import type { ISubscriptionProps } from "src/types/user";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import { Box, Card } from "@mui/material";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import { fDate } from "src/utils/format-time";
import { getPlanIcon } from "src/utils/plan-icon";
import { fCurrency } from "src/utils/format-number";

import { CONFIG } from "src/global-config";
import { PLAN_TYPE } from "src/consts/plan";
import { SUBSCRIPTION_STATUS } from "src/consts/subscription";
import { UpgradeButton } from "src/layouts/components/upgrade-button";

import { Label } from "src/components/label";

import { CancelSubscriptionForm } from "./cancel-subscription-form";

// ----------------------------------------------------------------------
type AccountSubscriptionViewProps = {
  data: ISubscriptionProps;
  language: Language;
};

const iconPath = (name: string) => `${CONFIG.assetsDir}/assets/icons/plans/${name}`;
export function AccountSubscriptionView({ data, language }: AccountSubscriptionViewProps) {
  const { t } = useTranslation("account");
  const { t: locale } = useTranslation("locale");

  const cancelSubscriptionFormOpen = useBoolean();

  console.log(data);

  const { type, license, interval, price, currency, nextBillingDate, isAutoRenew, status } = data;

  const isFreePlan = type === PLAN_TYPE.FREE;

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
              alt={license}
              src={iconPath(getPlanIcon(type || PLAN_TYPE.FREE))}
              sx={{ width: 80, height: 80 }}
            />

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              {license}
            </Typography>

            {status === SUBSCRIPTION_STATUS.TRIALING && (
              <Label color="success">{t("subscription.trial")}</Label>
            )}
          </Box>

          {isFreePlan && (
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              {t("subscription.sell")}
            </Typography>
          )}

          {!isFreePlan && currency && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                color: "text.secondary",
                typography: "body2",
              }}
            >
              {isAutoRenew ? (
                <>
                  {[
                    {
                      label: t("subscription.billing.label"),
                      value: t(`subscription.billing.${interval}`),
                    },
                    {
                      label: t("subscription.renewal.price"),
                      value: fCurrency(price, { code: locale("code"), currency }),
                    },
                    { label: t("subscription.renewal.date"), value: fDate(nextBillingDate) },
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {item.label}:
                      <Typography variant="body2" fontWeight="bold">
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </>
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {t("subscription.cancelled", { date: fDate(nextBillingDate) })}
                </Box>
              )}
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
        language={language}
      />
    </>
  );
}
