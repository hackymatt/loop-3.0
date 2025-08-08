"use client";

import type { IPlanProps } from "src/types/plan";
import type { BoxProps } from "@mui/material/Box";
import type { Language } from "src/locales/types";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { Divider } from "@mui/material";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useQueryParams } from "src/hooks/use-query-params";
import { useLocalizedPath } from "src/hooks/use-localized-path";

import { CONFIG } from "src/global-config";
import { PLAN_TYPE } from "src/consts/plan";
import { useCreatePaymentIntent } from "src/api/plan/payment";

import { useUserContext } from "src/components/user";
import { Form, Field } from "src/components/hook-form";
import { SplashScreen } from "src/components/loading-screen";
import { useSettingsContext } from "src/components/settings";

import { PaymentForm } from "../payment/payment-form";
import { PaymentSummary } from "../payment/payment-summary";
import { usePaymentSchema, useCustomerSchema } from "../payment/schema";

// ----------------------------------------------------------------------

const stripePromise = loadStripe(CONFIG.stripePublishableKey);

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
type PaymentViewProps = {
  data: { plan: IPlanProps };
  language: Language;
};

export function PaymentView({ data, language }: PaymentViewProps) {
  const { query } = useQueryParams();
  const theme = useTheme();
  const {
    state: { currency },
  } = useSettingsContext();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { mutateAsync: createPaymentIntent } = useCreatePaymentIntent("pl");

  const {
    plan: { pricing },
  } = data;

  const { monthly, yearly } = pricing.find((p) => p.currency === currency)!;
  const isYearlyPlan = query.yearly === "true";

  useEffect(() => {
    async function fetchPaymentIntent() {
      try {
        const {
          data: { client_secret },
        } = await createPaymentIntent({
          amount: (isYearlyPlan ? yearly : monthly) * 100,
          currency,
        });

        setClientSecret(client_secret);
      } catch {
        setClientSecret(null);
      }
    }

    fetchPaymentIntent();
  }, [createPaymentIntent, currency, isYearlyPlan, monthly, yearly]);

  if (!clientSecret) {
    return <SplashScreen />;
  }

  return (
    <Elements
      key={clientSecret}
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "flat",
          variables: {
            borderRadius: "8px",
            colorBackground: "#919eab14",
            colorPrimary: theme.palette.primary.main,
            spacingUnit: "4px",
          },
        },
      }}
    >
      <Payment data={data} language={language} />
    </Elements>
  );
}

function Payment({ data }: PaymentViewProps) {
  const localize = useLocalizedPath();
  const router = useRouter();

  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { t: account } = useTranslation("account");
  const { t } = useTranslation("payment");

  const user = useUserContext();
  const { email, firstName, lastName } = user.state;

  const { plan } = data;

  const isFreePlan = (plan.slug || PLAN_TYPE.FREE) === PLAN_TYPE.FREE;

  const PaymentSchema = zod.object({
    summary: usePaymentSchema(),
    customer: useCustomerSchema(),
  });

  type PaymentSchemaType = zod.infer<typeof PaymentSchema>;

  const defaultValues: PaymentSchemaType = useMemo(
    () => ({
      summary: { termsAcceptance: false },
      customer: {
        email: email || "",
        firstName: firstName || "",
        lastName: lastName || "",
      },
    }),
    [email, firstName, lastName]
  );

  const methods = useForm<PaymentSchemaType>({
    resolver: zodResolver(PaymentSchema),
    mode: "onChange",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const stripe = useStripe();
  const elements = useElements();

  const onSubmit = handleSubmit(async (formData) => {
    if (!stripe || !elements) {
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: localize(`${window.location.origin}${paths.order.completed}`),
      },
      redirect: "if_required",
    });

    if (error) {
      setPaymentError(error.message || null);
    } else if (paymentIntent) {
      setPaymentError(null);
      router.push(paths.order.completed);
    }
  });

  const renderAccountDetails = () => (
    <>
      <StepLabel title={t("customer.label")} step="1" />
      <Box sx={{ gap: 5, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            rowGap: 2,
            display: "grid",
            gridTemplateColumns: "repeat(1, 1fr)",
          }}
        >
          <Field.Text name="customer.email" label={account("email.label")} disabled />
          <Field.Text name="customer.firstName" label={account("firstName.label")} />
          <Field.Text name="customer.lastName" label={account("lastName.label")} />
        </Box>
      </Box>
    </>
  );

  const renderPaymentMethods = () => (
    <>
      <StepLabel title={t("paymentMethods.label")} step="2" />
      {paymentError && (
        <Typography variant="body2" color="error" sx={{ width: 1, p: 1 }}>
          {paymentError}
        </Typography>
      )}
      <PaymentForm />
    </>
  );

  return (
    <Container sx={{ pb: 10, pt: { xs: 3, md: 5 } }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: "center" }}>
        {t("title")}
      </Typography>

      <Typography sx={{ textAlign: "center", color: "text.secondary", mb: 5 }}>
        {t("subtitle").replace("{plan}", plan?.license || "")}
      </Typography>

      <Form methods={methods} onSubmit={onSubmit}>
        {!isFreePlan ? (
          <Grid container spacing={{ xs: 5, md: 8 }}>
            <Grid size={{ xs: 12, md: 7 }}>
              {renderAccountDetails()}

              <Divider sx={{ my: 5, borderStyle: "dashed" }} />

              {renderPaymentMethods()}
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>{plan && <PaymentSummary plan={plan} />}</Grid>
          </Grid>
        ) : (
          <Grid container spacing={{ xs: 5, md: 8 }} justifyContent="center">
            <Grid size={{ xs: 12, md: 5 }}>{plan && <PaymentSummary plan={plan} />}</Grid>
          </Grid>
        )}
      </Form>
    </Container>
  );
}

// ----------------------------------------------------------------------

type StepLabelProps = BoxProps & {
  step: string;
  title: string;
};

function StepLabel({ step, title, sx, ...other }: StepLabelProps) {
  return (
    <Box
      sx={[
        { mb: 3, gap: 1.5, display: "flex", typography: "h6", alignItems: "center" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          flexShrink: 0,
          display: "flex",
          borderRadius: "50%",
          alignItems: "center",
          typography: "subtitle1",
          bgcolor: "primary.main",
          justifyContent: "center",
          color: "primary.contrastText",
        }}
      >
        {step}
      </Box>

      {title}
    </Box>
  );
}
