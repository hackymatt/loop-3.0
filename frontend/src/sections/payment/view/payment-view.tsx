"use client";

import type { PlanType } from "src/types/plan";
import type { BoxProps } from "@mui/material/Box";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { Divider } from "@mui/material";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useQueryParams } from "src/hooks/use-query-params";
import { useLocalizedPath } from "src/hooks/use-localized-path";
import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { usePlan } from "src/api/plan/plan";
import { PLAN_TYPE } from "src/consts/plan";
import { useSubscribe } from "src/api/plan/subscribe";

import { useUserContext } from "src/components/user";
import { Form, Field } from "src/components/hook-form";
import { SplashScreen } from "src/components/loading-screen";

import { NotFoundView } from "src/sections/error/not-found-view";

import { PaymentForm } from "../payment-form";
import { PaymentSummary } from "../payment-summary";
import { usePaymentSchema, useCustomerSchema, usePaymentMethods } from "../schema";

// ----------------------------------------------------------------------

export function PaymentView() {
  const { query } = useQueryParams();
  const router = useRouter();
  const localize = useLocalizedPath();

  const { t: account } = useTranslation("account");
  const { t } = useTranslation("payment");

  const user = useUserContext();
  const { email, firstName, lastName } = user.state;

  const { data: plan, isLoading, isError } = usePlan(query.plan);
  const { mutateAsync: subscribe } = useSubscribe();

  const isFreePlan = (plan?.slug || PLAN_TYPE.FREE) === PLAN_TYPE.FREE;

  const PaymentSchema = zod.object({
    summary: usePaymentSchema(),
    customer: useCustomerSchema(),
    paymentMethods: usePaymentMethods(),
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
      paymentMethods: {
        method: "card",
        card: { number: "", holder: "", expiration: "", security: "" },
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
    reset({
      ...defaultValues,
      paymentMethods: {
        method: isFreePlan ? "" : "card",
        card: { number: "", holder: "", expiration: "", security: "" },
      },
    });
  }, [defaultValues, isFreePlan, reset]);

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { data: response } = await subscribe({
        plan: query.plan,
        interval: query.plan === PLAN_TYPE.FREE ? null : query.yearly ? "yearly" : "monthly",
        user: { first_name: data.customer.firstName, last_name: data.customer.lastName },
      });
      const { type, ...rest } = response;
      user.setField("plan", { ...rest, type: type as PlanType });
      router.push(localize(paths.account.dashboard));
    } catch (error) {
      handleFormError(error);
    }
  });

  if (isError) {
    return <NotFoundView />;
  }

  if (isLoading) {
    return <SplashScreen />;
  }

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
      <PaymentForm
        name="paymentMethods.method"
        options={[
          {
            label: t("paymentMethods.card.label"),
            value: "card",
            description: t("paymentMethods.card.description"),
          },
          {
            label: t("paymentMethods.applepay.label"),
            value: "applepay",
            description: t("paymentMethods.applepay.description"),
          },
          {
            label: t("paymentMethods.googlepay.label"),
            value: "googlepay",
            description: t("paymentMethods.googlepay.description"),
          },
        ]}
      />
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
