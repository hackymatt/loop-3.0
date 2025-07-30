import type { BoxProps } from "@mui/material/Box";
import type { TextFieldProps } from "@mui/material/TextField";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";
import { useController, useFormContext } from "react-hook-form";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

import { Field } from "src/components/hook-form";
import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------

type PaymentNewCardFormProps = BoxProps & {
  numberField?: TextFieldProps & { name: string };
  holderField?: TextFieldProps & { name: string };
  dateField?: TextFieldProps & { name: string };
  cvvField?: TextFieldProps & { name: string };
};

export function PaymentNewCardForm({
  sx,
  cvvField,
  dateField,
  numberField,
  holderField,
  ...other
}: PaymentNewCardFormProps) {
  const showPassword = useBoolean();
  const { t } = useTranslation("payment");

  const { control } = useFormContext();

  const {
    field: { value: cardNumber },
  } = useController({ name: "paymentMethods.card.number", control });

  const detectCardProvider = () => {
    const visaPattern = /^4/;
    const masterCardPattern = /^(5[1-5]|2[2-7])/;

    if (visaPattern.test(cardNumber)) {
      return "visa";
    }
    if (masterCardPattern.test(cardNumber)) {
      return "mastercard";
    }
    return undefined;
  };

  const cardProvider = detectCardProvider();

  return (
    <Box
      sx={[
        { gap: 2.5, width: 1, display: "flex", flexDirection: "column" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Card Number Field with Mask */}
      <Field.Text
        label={t("card.number.label")}
        placeholder="xxxx xxxx xxxx xxxx"
        mask={(value) => value.replace(/(\d{4})(?=\d)/g, "$1 ")}
        unmask={(value) => value.replace(/\D/g, "")}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon={`logos:${cardProvider}`} />
              </InputAdornment>
            ),
          },
        }}
        {...numberField}
        name={numberField?.name ?? ""}
      />

      {/* Card Holder Field */}
      <Field.Text
        label={t("card.holder.label")}
        placeholder={t("card.holder.placeholder")}
        slotProps={{
          inputLabel: { shrink: true },
        }}
        {...holderField}
        name={holderField?.name ?? ""}
      />

      <Box sx={{ gap: 2, display: "flex" }}>
        {/* Expiration Date Field with Mask */}
        <Field.Text
          fullWidth
          label={t("card.expiration.label")}
          placeholder="MM/YY"
          mask={(value: string) => {
            const digits = value.replace(/\D/g, "");
            if (digits.length <= 2) return digits;
            return digits.slice(0, 2) + "/" + digits.slice(2, 4);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          {...dateField}
          name={dateField?.name ?? ""}
        />

        {/* CVV Field */}
        <Field.Text
          fullWidth
          label={t("card.security.label")}
          placeholder="***"
          mask={(value: string) => value.replace(/\D/g, "").slice(0, 3)}
          unmask={(value: string) => value.replace(/\D/g, "")}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify
                      icon={showPassword.value ? "solar:eye-outline" : "solar:eye-closed-outline"}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          type={showPassword.value ? "text" : "password"}
          {...cvvField}
          name={cvvField?.name ?? ""}
        />
      </Box>
    </Box>
  );
}
