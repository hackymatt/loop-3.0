"use client";

import type { ICardProps, IPaypalProps, IPaymentMethodProps } from "src/types/user";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { PAYMENT_METHODS } from "src/consts/payment";

import { AccountPaymentCard } from "../account/account-payment-card";
import { AccountPaymentPaypal } from "../account/account-payment-paypal";

// ----------------------------------------------------------------------
type AccountPaymentViewProps = {
  data: IPaymentMethodProps[];
};

export function AccountPaymentView({ data }: AccountPaymentViewProps) {
  const { t } = useTranslation("account");
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
        {data.map(({ id, type, isDefault, details }) =>
          type === PAYMENT_METHODS.CARD ? (
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
          ) : (
            <AccountPaymentPaypal
              key={id}
              id={id}
              paypal={{ email: (details as IPaypalProps).payerEmail, isPrimary: isDefault }}
            />
          )
        )}
      </Box>

      <Divider sx={{ my: 5, borderStyle: "dashed" }} />

      <Box sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
        <Button variant="text">+ {t("payment.add")}</Button>
      </Box>
    </>
  );
}
