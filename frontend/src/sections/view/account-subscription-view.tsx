"use client";

import type { PaperProps } from "@mui/material";
import type { Currency, PlanType, IPlanProps, PlanInterval } from "src/types/plan";
import type { ICardProps, ISubscriptionProps, IPaymentMethodProps } from "src/types/user";

import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSetState } from "minimal-shared/hooks";

import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Link, Paper, Button } from "@mui/material";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { fDate } from "src/utils/format-time";
import { fCurrency } from "src/utils/format-number";

import { PAYMENT_METHOD } from "src/consts/payment";
import { useInvoicePreview } from "src/api/plan/invoice";
import { PLAN_TYPE, PLAN_INTERVAL } from "src/consts/plan";
import { SUBSCRIPTION_STATUS } from "src/consts/subscription";
import { UpgradeButton } from "src/layouts/components/upgrade-button";
import {
  useRenewSubscription,
  useCancelSubscription,
  useChangeSubscription,
} from "src/api/me/manage-subscription";

import { Label } from "src/components/label";
import { Form } from "src/components/hook-form";
import { Iconify } from "src/components/iconify";

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

  const {
    type,
    license,
    interval,
    price,
    amountDue,
    currency,
    nextBillingDate,
    isCancelAtPeriodEnd,
    status,
  } = subscription;

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

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", mt: 2 }}>
          {status === SUBSCRIPTION_STATUS.TRIALING && (
            <Label color={isCancelAtPeriodEnd ? "default" : "warning"}>
              {!isCancelAtPeriodEnd && <Iconify icon="solar:clock-circle-outline" width={16} />}
              {t(`subscription.${isCancelAtPeriodEnd ? "ending" : "trial"}`, {
                date: fDate(nextBillingDate, "DD MMM"),
              })}
            </Label>
          )}
          <Typography variant="h5">{t("subscription.license", { plan: license })}</Typography>
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
              {t(
                isCancelAtPeriodEnd
                  ? "subscription.billing.label.cancel"
                  : status === SUBSCRIPTION_STATUS.TRIALING
                    ? "subscription.billing.label.trial"
                    : "subscription.billing.label.standard",
                { date: fDate(nextBillingDate, "D MMMM YYYY") }
              )}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                display: "flex",
                mt: 2,
                alignItems: "center",
              }}
            >
              {t("subscription.invoice")}&nbsp;
              <Box component="span" fontWeight="bold">
                {fCurrency(amountDue, { code: locale("code"), currency })}
              </Box>
              .
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
            minWidth: 220,
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
  subscription: ISubscriptionProps;
  plan: PricingCardProps;
  interval: PlanInterval;
  currency: Currency;
  selected: boolean;
  onSelected: VoidFunction;
};

export function SubscriptionOption({
  subscription,
  plan,
  interval,
  currency,
  selected,
  onSelected,
  sx,
  ...other
}: SubscriptionOptionProps) {
  const { t } = useTranslation("pricing");
  const { t: account } = useTranslation("account");
  const { t: locale } = useTranslation("locale");

  const { type, interval: currentInterval, currency: currentCurrency } = subscription;

  const isCurrentPlan =
    plan.type === type &&
    ((interval === currentInterval && currency === currentCurrency) ||
      plan.type === PLAN_TYPE.FREE);

  const renderPrices = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "baseline" }}>
        <Typography component="span" variant="h3">
          {fCurrency(interval === PLAN_INTERVAL.YEARLY ? plan.price / 12 : plan.price, {
            code: locale("code"),
            currency,
          })}
        </Typography>

        <Typography component="span" variant="subtitle2">
          /{t("monthlyShort")}
        </Typography>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          mt: "-2px",
          lineHeight: 1,
          visibility: interval === PLAN_INTERVAL.YEARLY ? "visible" : "hidden",
        }}
      >
        {t("billed")}
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
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 2,
          position: "relative",
          bgcolor: "transparent",
          boxShadow: theme.vars.customShadows.card,
          [theme.breakpoints.up("md")]: { boxShadow: "none" },
          ...(selected && { borderColor: "primary.main" }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Label on top */}
      {isCurrentPlan && (
        <Label
          color="primary"
          sx={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1,
            px: 2,
            py: 0.5,
            bgcolor: "background.paper",
            ...(selected && { borderColor: "primary.main" }),
          }}
        >
          {account("subscription.label")}
        </Label>
      )}

      {/* Plan license */}
      <Box component="span" sx={{ color: "text.secondary", typography: "overline" }}>
        {plan.license}
      </Box>

      {renderPrices()}

      <Button
        fullWidth
        variant="outlined"
        color={selected ? "primary" : "inherit"}
        onClick={onSelected}
        sx={{ textWrap: "nowrap" }}
      >
        {selected && <Iconify icon="solar:check-circle-outline" style={{ marginRight: 8 }} />}
        {selected ? t("chosen") : t("choose")}
      </Button>
    </Paper>
  );
}

// ----------------------------------------------------------------------

type SettingState = {
  interval: PlanInterval;
  type: PlanType;
};

type InvoicePreviewProps = {
  amountDue: number;
  billingDate: DatePickerFormat;
};

type ChangeStepProps = {
  data: {
    subscription: ISubscriptionProps;
    plans: IPlanProps[];
    paymentMethods: IPaymentMethodProps[];
  };
  onChange: (setting: SettingState & { currency: Currency; invoice: InvoicePreviewProps }) => void;
  onCancel: VoidFunction;
  onClose: VoidFunction;
};

function ChangeStep({ data, onCancel, onChange, onClose }: ChangeStepProps) {
  const { t } = useTranslation("account");
  const { t: locale } = useTranslation("locale");
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: previewInvoice } = useInvoicePreview();

  const { subscription, plans } = data;
  const { interval, currency, type } = subscription;

  const setting = useSetState<SettingState>({
    interval: interval || PLAN_INTERVAL.YEARLY,
    type,
  });

  const isCurrentPlanSelected = setting.state.type === type && setting.state.interval === interval;

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

  const onSubmit = handleSubmit(async () => {
    try {
      if (setting.state.type === PLAN_TYPE.FREE) {
        onCancel();
        return;
      }
      const {
        data: { amount_due: amountDue, billing_date: billingDate },
      } = await previewInvoice({
        plan: setting.state.type,
        interval: setting.state.interval,
        currency: currency!,
      });
      onChange({ ...setting.state, currency: currency!, invoice: { amountDue, billingDate } });
    } catch {
      enqueueSnackbar(t("subscription.error"), { variant: "error" });
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
                  subscription={subscription}
                  plan={plan}
                  interval={setting.state.interval}
                  currency={currency || (locale("currency") as Currency)}
                  selected={plan.type === setting.state.type}
                  onSelected={() => setting.setField("type", plan.type)}
                />
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
              typography: "h6",
            }}
          >
            <Typography>{t("subscription.change.summary")}:</Typography>

            <Box
              sx={{
                gap: 0.5,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography component="span">
                {fCurrency(options.find((x) => x.type === setting.state.type)?.price, {
                  code: locale("code"),
                  currency: currency!,
                })}
              </Typography>

              <Typography component="span">
                {t(`subscription.billing.${setting.state.interval}`)}
              </Typography>
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
              color="primary"
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              disabled={isCurrentPlanSelected}
              sx={{ textWrap: "nowrap", width: { xs: "100%", md: "auto" } }}
            >
              {t("subscription.change.approve")}
            </LoadingButton>

            <Button
              variant="outlined"
              size="large"
              onClick={onClose}
              color="inherit"
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              {t("subscription.change.cancel")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Form>
  );
}

// ----------------------------------------------------------------------

type ConfirmStepProps = {
  data: {
    subscription: ISubscriptionProps;
    plans: IPlanProps[];
    paymentMethods: IPaymentMethodProps[];
  };
  newSubscription: NewSubscriptionProps;
  onClose: VoidFunction;
};

function ConfirmStep({ data, newSubscription, onClose }: ConfirmStepProps) {
  const { t } = useTranslation("account");
  const { t: locale } = useTranslation("locale");
  const localize = useLocalizedPath();
  const { enqueueSnackbar } = useSnackbar();

  const { subscription, plans, paymentMethods } = data;

  const { status, nextBillingDate } = subscription;

  const { mutateAsync: changeSubscription } = useChangeSubscription();

  const defaultPaymentMethod = paymentMethods.find((method) => method.isDefault);

  const payment = useMemo(() => {
    if (!defaultPaymentMethod) return "";

    const { type, details } = defaultPaymentMethod;

    switch (type) {
      case PAYMENT_METHOD.CARD: {
        const card = details as ICardProps;
        if (!card.displayBrand || !card.last4) return "";
        const brand = card.displayBrand.charAt(0).toUpperCase() + card.displayBrand.slice(1);
        return `${brand} •••• ${card.last4}`;
      }

      case PAYMENT_METHOD.PAYPAL:
        return "PayPal";

      case PAYMENT_METHOD.REVOLUT_PAY:
        return "Revolut Pay";

      default:
        return "";
    }
  }, [defaultPaymentMethod]);

  const options = (plans || []).map(({ pricing, ...rest }: IPlanProps) => {
    const priceObj = pricing.find(
      (p) => p.currency === newSubscription.currency && p.interval === newSubscription.interval
    )!;
    return {
      ...rest,
      price: priceObj.price,
    };
  });

  const option = options.find((o) => o.type === newSubscription.type);

  const methods = useForm();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async () => {
    try {
      const { type: plan, ...rest } = newSubscription;
      await changeSubscription({ ...rest, plan });
      onClose();
    } catch {
      enqueueSnackbar(t("subscription.error"), { variant: "error" });
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
            {t("subscription.confirm.title")}
          </Typography>

          <Typography variant="h5">
            {t("subscription.license", { plan: option?.license })}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
            }}
          >
            <Typography>
              {t("subscription.confirm.summary", {
                frequency: t(`subscription.confirm.frequency.${newSubscription.interval}`),
                date: fDate(newSubscription.invoice.billingDate, "D MMMM YYYY"),
              })}
            </Typography>

            <Typography component="span" variant="h5">
              {fCurrency(option?.price, {
                code: locale("code"),
                currency: newSubscription.currency,
              })}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
            }}
          >
            <Typography>
              {status === SUBSCRIPTION_STATUS.TRIALING
                ? t("subscription.confirm.payAfterTrial", {
                    date: fDate(nextBillingDate, "D MMMM YYYY"),
                  })
                : t("subscription.confirm.payNow")}
            </Typography>

            <Typography component="span" variant="h5">
              {fCurrency(Math.max(newSubscription.invoice.amountDue, 0), {
                code: locale("code"),
                currency: newSubscription.currency,
              })}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 3,
            }}
          >
            <Link
              component={RouterLink}
              href={localize(paths.account.payment)}
              sx={{
                color: "primary.main",
                textDecoration: "none",
                typography: "body2",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {payment || t("payment.add")}
              {payment && <Iconify icon="solar:pen-new-square-outline" width={14} />}
            </Link>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row-reverse" },
              alignItems: "center",
              mt: 5,
              gap: 1,
            }}
          >
            <LoadingButton
              color="primary"
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              sx={{
                width: { xs: "100%", md: "auto" },
                textTransform: "none",
              }}
            >
              {t("subscription.confirm.approve")}
            </LoadingButton>

            <Button
              variant="outlined"
              size="large"
              onClick={onClose}
              color="inherit"
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              {t("subscription.confirm.cancel")}
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

  const { enqueueSnackbar } = useSnackbar();

  const { license, interval, price, currency, nextBillingDate } = subscription;

  const { mutateAsync: cancelSubscription } = useCancelSubscription();

  const methods = useForm();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async () => {
    try {
      await cancelSubscription({});
      onClose();
    } catch {
      enqueueSnackbar(t("subscription.error"), { variant: "error" });
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

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", mt: 2 }}>
            <Typography variant="h5">{t("subscription.license", { plan: license })}</Typography>
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
              date: fDate(nextBillingDate, "D MMMM YYYY"),
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
  const { enqueueSnackbar } = useSnackbar();

  const { license, interval, price, currency, nextBillingDate } = subscription;

  const { mutateAsync: renewSubscription } = useRenewSubscription();

  const methods = useForm();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (newData) => {
    try {
      await renewSubscription({});
      onClose();
    } catch {
      enqueueSnackbar(t("subscription.error"), { variant: "error" });
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

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", mt: 2 }}>
            <Typography variant="h5">{t("subscription.license", { plan: license })}</Typography>
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
              date: fDate(nextBillingDate, "D MMMM YYYY"),
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
  data: {
    subscription: ISubscriptionProps;
    plans: IPlanProps[];
    paymentMethods: IPaymentMethodProps[];
  };
};

type NewSubscriptionProps = {
  type: PlanType;
  interval: PlanInterval;
  currency: Currency;
  invoice: InvoicePreviewProps;
};

export function AccountSubscriptionView({ data }: AccountSubscriptionViewProps) {
  const { t } = useTranslation("account");

  const { subscription } = data;

  const [activeStep, setActiveStep] = useState(0);
  const newSubscription = useSetState<NewSubscriptionProps>();

  const STEPS = [
    <MainStep
      subscription={subscription}
      onChange={() => setActiveStep(1)}
      onCancel={() => setActiveStep(3)}
      onRenew={() => setActiveStep(4)}
    />,
    <ChangeStep
      data={data}
      onChange={(selection) => {
        newSubscription.setState(selection);
        setActiveStep(2);
      }}
      onCancel={() => setActiveStep(3)}
      onClose={() => setActiveStep(0)}
    />,
    <ConfirmStep
      data={data}
      newSubscription={newSubscription.state}
      onClose={() => setActiveStep(0)}
    />,
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
