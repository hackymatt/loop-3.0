"use client";

import type { IPlanProps } from "src/types/plan";
import type { BoxProps } from "@mui/material/Box";
import type { Language } from "src/locales/types";
import type { IPersonalDataProps } from "src/types/user";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Elements,
  useStripe,
  useElements,
  AddressElement,
  PaymentElement,
} from "@stripe/react-stripe-js";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { Divider } from "@mui/material";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { CONFIG } from "src/global-config";
import { PLAN_TYPE } from "src/consts/plan";

import { Form } from "src/components/hook-form";

import { usePaymentSchema } from "../payment/schema";
import { PaymentSummary } from "../payment/payment-summary";

// ----------------------------------------------------------------------

const stripePromise = loadStripe(CONFIG.stripePublishableKey);

// ----------------------------------------------------------------------

type PaymentViewProps = {
  data: {
    plan: IPlanProps;
    personal: IPersonalDataProps;
    clientSecret: string;
    customerSessionClientSecret: string;
  };
  language: Language;
};

export function PaymentView({ data, language }: PaymentViewProps) {
  const theme = useTheme();
  const { clientSecret, customerSessionClientSecret } = data;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        customerSessionClientSecret,
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

  const { t } = useTranslation("payment");
  const { t: locale } = useTranslation("locale");
  const { t: countries } = useTranslation("countries");

  const countriesList = countries("countries", { returnObjects: true }) as {
    code: string;
    label: string;
    phone: string;
  }[];

  const { plan, personal } = data;
  const { email, firstName, lastName, streetAddress, zipCode, city, country } = personal;

  const isFreePlan = (plan.type || PLAN_TYPE.FREE) === PLAN_TYPE.FREE;

  const PaymentSchema = zod.object({
    summary: usePaymentSchema(),
  });

  type PaymentSchemaType = zod.infer<typeof PaymentSchema>;

  const defaultValues: PaymentSchemaType = useMemo(
    () => ({
      summary: { termsAcceptance: false },
    }),
    []
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

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: localize(`${window.location.origin}${paths.orderStatus}`),
      },
    });

    if (error) {
      setPaymentError(error.message || null);
    } else {
      router.push(paths.orderStatus);
    }
  });

  function findCountryCode(countryLabel: string) {
    return countriesList.find((countryObj) => countryObj.label === countryLabel)?.code;
  }

  const renderAccountDetails = () => (
    <>
      <StepLabel title={t("customer.label")} step="1" />
      <AddressElement
        options={{
          mode: "billing",
          defaultValues: {
            name: `${firstName} ${lastName}`,
            address: {
              line1: streetAddress,
              line2: "",
              city,
              postal_code: zipCode,
              state: "",
              country: findCountryCode(country || locale("country")) || "PL",
            },
          },
        }}
        onChange={(event) => {
          console.log("Address changed:", event.value);
        }}
      />
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
      <PaymentElement
        options={{
          defaultValues: {
            billingDetails: {
              name: `${firstName}  ${lastName}`,
              email: email!,
            },
          },
          layout: {
            type: "accordion",
            radios: true,
            defaultCollapsed: false,
          },
        }}
      />
    </>
  );

  return (
    <Container sx={{ pb: 10, pt: { xs: 3, md: 5 } }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: "center" }}>
        {t("title")}
      </Typography>

      <Typography sx={{ textAlign: "center", color: "text.secondary", mb: 5 }}>
        {t("subtitle", { plan: plan?.license || "" })}
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
