"use client";

import type {
  ICardProps,
  IPaypalProps,
  IPersonalDataProps,
  IPaymentMethodProps,
} from "src/types/user";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import { paths } from "src/routes/paths";

import { useQueryParams } from "src/hooks/use-query-params";
import { useLocalizedPath } from "src/hooks/use-localized-path";

import { CONFIG } from "src/global-config";
import { PAYMENT_METHODS } from "src/consts/payment";
import { useCreateSetupIntent } from "src/api/plan/setup-intent";

import { AccountPaymentCard } from "../account/payment/account-payment-card";
import { AccountPaymentPaypal } from "../account/payment/account-payment-paypal";
import { AccountPaymentRevolutPay } from "../account/payment/account-payment-revolutpay";

const stripePromise = loadStripe(CONFIG.stripePublishableKey);

type AccountPaymentViewProps = {
  data: { paymentMethods: IPaymentMethodProps[]; personal: IPersonalDataProps };
};

export function AccountPaymentView({ data }: AccountPaymentViewProps) {
  const { t } = useTranslation("account");
  const theme = useTheme();
  const { query } = useQueryParams();

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { paymentMethods, personal } = data;
  const { mutateAsync: createSetupIntent, isLoading } = useCreateSetupIntent();

  const handleAddPaymentMethod = async () => {
    try {
      const { client_secret } = await createSetupIntent({});
      setClientSecret(client_secret);
    } catch (error) {
      console.error("Error creating setup intent:", error);
    }
  };

  const getDisplayCard = useCallback((paymentMethod: IPaymentMethodProps) => {
    const { id, type, isDefault, details } = paymentMethod;
    switch (type) {
      case PAYMENT_METHODS.CARD:
        return (
          <AccountPaymentCard
            key={id}
            id={id}
            card={{
              value: (details as ICardProps).wallet || (details as ICardProps).brand,
              label: (details as ICardProps).displayBrand,
              number: (details as ICardProps).last4,
              expired: `${(details as ICardProps).expMonth || "--"}/${(details as ICardProps).expYear || "--"}`,
              holder: (details as ICardProps).holder || "---",
              isPrimary: isDefault,
            }}
          />
        );
      case PAYMENT_METHODS.PAYPAL:
        return (
          <AccountPaymentPaypal
            key={id}
            id={id}
            paypal={{ email: (details as IPaypalProps).payerEmail, isPrimary: isDefault }}
          />
        );
      case PAYMENT_METHODS.REVOLUT_PAY:
        return <AccountPaymentRevolutPay key={id} id={id} revolutPay={{ isPrimary: isDefault }} />;
      default:
        return null;
    }
  }, []);

  return (
    <>
      <Typography variant="h5">{t("payment.title")}</Typography>

      <Box
        sx={{
          mt: 3,
          gap: 3,
          display: "grid",
          gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" },
        }}
      >
        {paymentMethods.map((paymentMethod) => getDisplayCard(paymentMethod))}
      </Box>

      {paymentMethods.length > 0 && <Divider sx={{ my: 5, borderStyle: "dashed" }} />}

      <Box sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
        {!clientSecret && (
          <LoadingButton variant="text" onClick={handleAddPaymentMethod} loading={isLoading}>
            + {t("payment.add")}
          </LoadingButton>
        )}

        {query?.redirect_status === "failed" && (
          <Typography color="error" variant="body2">
            {t("payment.error")}
          </Typography>
        )}

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "flat",
                variables: {
                  borderRadius: "8px",
                  colorBackground: theme.palette.background.defaultChannel,
                  colorPrimary: theme.palette.primary.main,
                  spacingUnit: "4px",
                },
              },
            }}
          >
            <AddNewPaymentMethod personal={personal} />
          </Elements>
        )}
      </Box>
    </>
  );
}

type AddNewPaymentMethodProps = {
  personal: IPersonalDataProps;
};

function AddNewPaymentMethod({ personal }: AddNewPaymentMethodProps) {
  const { t } = useTranslation("account");

  const localize = useLocalizedPath();

  const stripe = useStripe();
  const elements = useElements();

  const handleSavePaymentMethod = async () => {
    if (!stripe || !elements) return;

    await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: localize(`${window.location.origin}${paths.account.payment}`) },
    });
  };

  return (
    <>
      <PaymentElement
        options={{
          defaultValues: {
            billingDetails: {
              name: `${personal.firstName} ${personal.lastName}`,
              email: personal.email || undefined,
              address: {
                line1: personal.streetAddress || undefined,
                postal_code: personal.zipCode || undefined,
                city: personal.city || undefined,
                country: personal.country || undefined,
              },
            },
          },
          layout: {
            type: "accordion",
            radios: true,
            defaultCollapsed: false,
          },
        }}
      />

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSavePaymentMethod}>
        + {t("payment.add")}
      </Button>
    </>
  );
}
