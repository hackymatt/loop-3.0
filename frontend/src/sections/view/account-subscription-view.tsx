"use client";

import type { PaperProps } from "@mui/material";
import type { ISubscriptionProps } from "src/types/user";
import type { Currency, IPlanProps, PlanInterval } from "src/types/plan";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSetState } from "minimal-shared/hooks";

import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Paper, Button } from "@mui/material";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";
import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { fDate } from "src/utils/format-time";
import { fCurrency } from "src/utils/format-number";

import { useAnalytics } from "src/app/analytics-provider";
import { PLAN_TYPE, PLAN_INTERVAL } from "src/consts/plan";
import { SUBSCRIPTION_STATUS } from "src/consts/subscription";
import { UpgradeButton } from "src/layouts/components/upgrade-button";
import { useCreateCustomerPortalLink } from "src/api/me/customer-portal-link";

import { Label } from "src/components/label";
import { Form } from "src/components/hook-form";
import { useUserContext } from "src/components/user";

import IntervalToggle from "../pricing/interval-toogle";

import type { PricingCardProps } from "../pricing/types";

// ----------------------------------------------------------------------

type MainStepProps = {
  subscription: ISubscriptionProps;
  onChange: VoidFunction;
  onCancel: VoidFunction;
  onRenew: VoidFunction;
};

function MainStep({ subscription, onChange, onCancel, onRenew }: MainStepProps) {
  const { t } = useTranslation("account");
  const { t: locale } = useTranslation("locale");

  const { type, license, interval, price, currency, nextBillingDate, isCancelAtPeriodEnd, status } =
    subscription;

  const isFreePlan = type === PLAN_TYPE.FREE;

  return (
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
      {isFreePlan ? (
        <UpgradeButton slotProps={{ button: { size: "large" } }} />
      ) : (
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
          <Button variant="contained" color="primary" size="large" fullWidth onClick={onChange}>
            {t("subscription.buttons.change")}
          </Button>
          {isCancelAtPeriodEnd ? (
            <Button variant="outlined" size="large" fullWidth onClick={onRenew}>
              {t("subscription.buttons.renew")}
            </Button>
          ) : (
            <Button variant="outlined" size="large" fullWidth onClick={onCancel}>
              {t("subscription.buttons.cancel")}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

type SubscriptionOptionProps = PaperProps & {
  plan: PricingCardProps;
  interval: PlanInterval;
  currency: Currency;
};

export function SubscriptionOption({
  plan,
  interval,
  currency,
  sx,
  ...other
}: SubscriptionOptionProps) {
  const { t } = useTranslation("pricing");
  const { t: locale } = useTranslation("locale");
  const localize = useLocalizedPath();
  const router = useRouter();

  const { mutateAsync: createCustomerPortalLink, isLoading } = useCreateCustomerPortalLink();

  const user = useUserContext();
  const {
    isLoggedIn,
    plan: { type, currency: userCurrency, interval: userInterval },
  } = user.state;

  const isCurrentPlan =
    isLoggedIn &&
    plan.type === type &&
    ((interval === userInterval && currency === userCurrency) || plan.type === PLAN_TYPE.FREE);
  const isFreePlan = type === PLAN_TYPE.FREE;

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

  const renderPrices = () => (
    <Box
      sx={{
        gap: 0.5,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Typography component="span" variant="h3">
        {fCurrency(plan.price, { code: locale("code"), currency })}
      </Typography>

      <Typography component="span" variant="subtitle2">
        /{t(`${interval}Short`)}
      </Typography>
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
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box component="span" sx={{ color: "text.secondary", typography: "overline" }}>
        {plan.license}
      </Box>

      {renderPrices()}

      <LoadingButton
        fullWidth
        size="large"
        variant={isCurrentPlan ? "outlined" : "contained"}
        color="inherit"
        disabled={isCurrentPlan}
        loading={isLoading}
        onClick={async () => {
          trackEvent({ category: "pricing", label: plan.license, action: "choosePlan" });
          await handleRedirect();
        }}
        sx={{ textWrap: "nowrap" }}
      >
        {isCurrentPlan ? t("current") : `${t("choose")} ${plan.license}`}
      </LoadingButton>
    </Paper>
  );
}

// ----------------------------------------------------------------------

type ChangeStepProps = {
  data: { subscription: ISubscriptionProps; plans: IPlanProps[] };
  onClose: VoidFunction;
};

type SettingState = {
  interval: PlanInterval;
};

function ChangeStep({ data, onClose }: ChangeStepProps) {
  const { t } = useTranslation("account");
  const { t: locale } = useTranslation("locale");

  const { subscription, plans } = data;
  const { interval, currency } = subscription;

  const setting = useSetState<SettingState>({ interval: interval || PLAN_INTERVAL.YEARLY });

  const options = (plans || []).map(({ pricing, ...rest }: IPlanProps) => {
    const priceObj = pricing.find(
      (p) => p.currency === currency && p.interval === setting.state.interval
    )!;
    return {
      ...rest,
      price: priceObj.price,
    };
  });

  const methods = useForm();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (newData) => {
    try {
      onClose();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          mt: 5,
        }}
      >
        <Box sx={{ width: 1 }}>
          <Typography variant="overline" sx={{ color: "text.disabled" }}>
            {t("subscription.change.title")}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 3 }}>
            <IntervalToggle
              value={setting.state.interval}
              onChange={(newInterval) => setting.setField("interval", newInterval)}
            />

            <Box
              sx={{
                mt: 3,
                gap: 2,
                display: "grid",
                alignItems: "center",
                gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(3, 1fr)" },
              }}
            >
              {options.map((plan) => (
                <SubscriptionOption
                  key={plan.license}
                  plan={plan}
                  interval={setting.state.interval}
                  currency={currency || (locale("currency") as Currency)}
                />
              ))}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row-reverse" },
              alignItems: "center",
              mt: 5,
              gap: 1,
              width: { xs: 1, md: "auto" },
            }}
          >
            <LoadingButton
              fullWidth
              color="primary"
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              sx={{ textWrap: "nowrap" }}
            >
              {t("subscription.change.approve")}
            </LoadingButton>

            <Button variant="outlined" size="large" onClick={onClose} color="inherit" fullWidth>
              {t("subscription.change.cancel")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Form>
  );
}

// ----------------------------------------------------------------------

type CancelStepProps = {
  subscription: ISubscriptionProps;
  onClose: VoidFunction;
};

function CancelStep({ subscription, onClose }: CancelStepProps) {
  const { t } = useTranslation("account");
  const { t: locale } = useTranslation("locale");

  const { license, interval, price, currency, nextBillingDate, status } = subscription;

  const methods = useForm();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (newData) => {
    try {
      onClose();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
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
            {t("subscription.cancel.title")}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
            <Typography
              variant="h3"
              sx={{
                display: "flex",
              }}
            >
              {fCurrency(price, { code: locale("code"), currency })}{" "}
              {t(`subscription.billing.${interval}`)}
            </Typography>
          )}

          <Typography
            variant="body2"
            sx={{
              display: "flex",
              mt: 2,
            }}
          >
            {t("subscription.cancel.description.part_1", {
              date: fDate(nextBillingDate, "DD MMMM YYYY"),
            })}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              display: "flex",
              mt: 2,
            }}
          >
            {t("subscription.cancel.description.part_2")}
          </Typography>
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
          <LoadingButton
            color="error"
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
            fullWidth
            sx={{ textWrap: "nowrap" }}
          >
            {t("subscription.cancel.approve")}
          </LoadingButton>

          <Button variant="outlined" size="large" onClick={onClose} color="inherit" fullWidth>
            {t("subscription.cancel.cancel")}
          </Button>
        </Box>
      </Box>
    </Form>
  );
}

// ----------------------------------------------------------------------

type RenewStepProps = {
  subscription: ISubscriptionProps;
  onClose: VoidFunction;
};

function RenewStep({ subscription, onClose }: RenewStepProps) {
  const { t } = useTranslation("account");
  const { t: locale } = useTranslation("locale");

  const { license, interval, price, currency, nextBillingDate, status } = subscription;

  const methods = useForm();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (newData) => {
    try {
      onClose();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
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
            {t("subscription.renew.title")}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
            <Typography
              variant="h3"
              sx={{
                display: "flex",
              }}
            >
              {fCurrency(price, { code: locale("code"), currency })}{" "}
              {t(`subscription.billing.${interval}`)}
            </Typography>
          )}

          <Typography
            variant="body2"
            sx={{
              display: "flex",
              mt: 2,
            }}
          >
            {t("subscription.renew.description", {
              date: fDate(nextBillingDate, "DD MMMM YYYY"),
            })}
          </Typography>
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
          <LoadingButton
            color="error"
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
            fullWidth
            sx={{ textWrap: "nowrap" }}
          >
            {t("subscription.renew.approve")}
          </LoadingButton>

          <Button variant="outlined" size="large" onClick={onClose} color="inherit" fullWidth>
            {t("subscription.renew.cancel")}
          </Button>
        </Box>
      </Box>
    </Form>
  );
}

// ----------------------------------------------------------------------

type AccountSubscriptionViewProps = {
  data: { subscription: ISubscriptionProps; plans: IPlanProps[] };
};

export function AccountSubscriptionView({ data }: AccountSubscriptionViewProps) {
  const { t } = useTranslation("account");

  const { subscription } = data;

  const [activeStep, setActiveStep] = useState(0);

  const STEPS = [
    <MainStep
      subscription={subscription}
      onChange={() => setActiveStep(1)}
      onCancel={() => setActiveStep(2)}
      onRenew={() => setActiveStep(3)}
    />,
    <ChangeStep data={data} onClose={() => setActiveStep(0)} />,
    <CancelStep subscription={subscription} onClose={() => setActiveStep(0)} />,
    <RenewStep subscription={subscription} onClose={() => setActiveStep(0)} />,
  ];

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t("subscription.title")}
      </Typography>

      {STEPS[activeStep]}
    </>
  );
}
