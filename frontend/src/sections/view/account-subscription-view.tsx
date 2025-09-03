"use client";

import type { ISubscriptionProps } from "src/types/user";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import { Box, Button } from "@mui/material";
import Typography from "@mui/material/Typography";

import { fDate } from "src/utils/format-time";
import { fCurrency } from "src/utils/format-number";

import { PLAN_TYPE } from "src/consts/plan";
import { SUBSCRIPTION_STATUS } from "src/consts/subscription";

import { Label } from "src/components/label";

import { AccountSubscriptionRenewForm } from "../account/account-subscription-renew-form";
import { AccountSubscriptionCancelForm } from "../account/account-subscription-cancel-form";

// ----------------------------------------------------------------------
type AccountSubscriptionViewProps = {
  data: ISubscriptionProps;
};

export function AccountSubscriptionView({ data }: AccountSubscriptionViewProps) {
  const { t } = useTranslation("account");
  const { t: locale } = useTranslation("locale");

  const cancelFormOpen = useBoolean();
  const renewFormOpen = useBoolean();

  const { type, license, interval, price, currency, nextBillingDate, isCancelAtPeriodEnd, status } =
    data;

  const isFreePlan = type === PLAN_TYPE.FREE;

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t("subscription.title")}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          mt: 5,
        }}
      >
        <Box>
          <Typography variant="overline" sx={{ color: "text.disabled" }}>
            {t("subscription.label")}
          </Typography>

          <Box>
            <Typography
              variant="h5"
              sx={{
                mt: 1,
                display: "flex",
                gap: 1,
              }}
            >
              {t("subscription.license", { plan: license })}
            </Typography>

            {status === SUBSCRIPTION_STATUS.TRIALING && (
              <Label color="success">{t("subscription.trial")}</Label>
            )}
          </Box>

          {currency && (
            <>
              <Typography
                variant="h3"
                sx={{
                  display: "flex",
                }}
              >
                {fCurrency(price, { code: locale("code"), currency })}{" "}
                {t(`subscription.billing.${interval}`)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  display: "flex",
                  mt: 2,
                }}
              >
                {t("subscription.billing.label", { date: fDate(nextBillingDate, "DD MMMM YYYY") })}
              </Typography>
            </>
          )}

          {isFreePlan && (
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              {t("subscription.sell")}
            </Typography>
          )}
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 5,
            gap: 1,
            width: { xs: 1, md: "auto" },
          }}
        >
          <Button variant="contained" color="primary" size="large" fullWidth>
            {t("subscription.buttons.change")}
          </Button>
          {isCancelAtPeriodEnd ? (
            <Button variant="outlined" size="large" fullWidth onClick={renewFormOpen.onToggle}>
              {t("subscription.buttons.renew")}
            </Button>
          ) : (
            <Button variant="outlined" size="large" fullWidth onClick={cancelFormOpen.onToggle}>
              {t("subscription.buttons.cancel")}
            </Button>
          )}
        </Box>
      </Box>

      <AccountSubscriptionCancelForm
        nextBillingDate={nextBillingDate}
        open={cancelFormOpen.value}
        onClose={cancelFormOpen.onFalse}
      />

      <AccountSubscriptionRenewForm
        nextBillingDate={nextBillingDate}
        open={renewFormOpen.value}
        onClose={renewFormOpen.onFalse}
      />
    </>
  );
}
