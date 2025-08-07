import type { TextFieldProps } from "@mui/material/TextField";

import { useTranslation } from "react-i18next";

import { Box, type BoxProps } from "@mui/material";

import { Field } from "src/components/hook-form";

// ----------------------------------------------------------------------

type PaymentBlikFormProps = BoxProps & {
  codeField: TextFieldProps & { name: string };
};

export function PaymentBlikForm({ sx, codeField, ...other }: PaymentBlikFormProps) {
  const { t } = useTranslation("payment");

  return (
    <Box
      sx={[
        { gap: 2.5, width: 1, display: "flex", flexDirection: "column" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Field.Text
        label={t("blik.code.label")}
        placeholder="xxx xxx"
        mask={(value) => value.replace(/(\d{3})(?=\d)/g, "$1 ")}
        unmask={(value) => value.replace(/\D/g, "")}
        slotProps={{
          inputLabel: { shrink: true },
        }}
        {...codeField}
      />
    </Box>
  );
}
