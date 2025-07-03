import type { BoxProps } from "@mui/material/Box";

import { varAlpha } from "minimal-shared/utils";
import { Controller, useFormContext } from "react-hook-form";

import Box from "@mui/material/Box";

import { Iconify } from "src/components/iconify";

import { PaymentNewCardForm } from "src/sections/payment/payment-new-card-form";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  name: string;
  options: {
    label: string;
    value: string;
    description: string;
  }[];
};

export function PaymentForm({ name, options, sx, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <Box
          sx={[
            { gap: 3, display: "flex", flexDirection: "column" },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
          {...other}
        >
          {options.map((option) => {
            const isSelected = value === option.value;

            return (
              <OptionItem
                key={option.label}
                option={option}
                selected={isSelected}
                onClick={() => onChange(option.value)}
              />
            );
          })}
        </Box>
      )}
    />
  );
}

// ----------------------------------------------------------------------

type OptionItemProps = BoxProps & {
  selected: boolean;
  option: Props["options"][number];
};

function OptionItem({ option, selected, sx, ...other }: OptionItemProps) {
  return (
    <Box
      sx={[
        (theme) => ({
          borderRadius: 1.5,
          border: `solid 1px ${varAlpha(theme.vars.palette.grey["500Channel"], 0.24)}`,
          transition: theme.transitions.create(["box-shadow"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shortest,
          }),
          ...(selected && { boxShadow: `0 0 0 2px ${theme.vars.palette.text.primary}` }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        sx={{ px: 2, gap: 2, height: 80, display: "flex", cursor: "pointer", alignItems: "center" }}
      >
        <Iconify
          width={24}
          icon={selected ? "solar:check-circle-bold" : "carbon:radio-button"}
          sx={{ color: "text.disabled", ...(selected && { color: "primary.main" }) }}
        />

        <Box sx={{ gap: 0.5, display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <Box component="span" sx={{ typography: "subtitle1" }}>
            {option.label}
          </Box>

          <Box component="span" sx={{ typography: "caption", color: "text.secondary" }}>
            {option.description}
          </Box>
        </Box>

        <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
          {option.value === "card" ? (
            <>
              <Iconify width={24} icon="logos:mastercard" />
              <Iconify width={24} icon="logos:visa" />
            </>
          ) : option.value === "applepay" ? (
            <Iconify width={24} icon="logos:apple-pay" />
          ) : option.value === "googlepay" ? (
            <Iconify width={24} icon="logos:google-pay" />
          ) : null}
        </Box>
      </Box>

      {option.value === "card" && selected && (
        <Box
          sx={{
            gap: 2.5,
            display: "flex",
            alignItems: "flex-end",
            flexDirection: "column",
            px: 3,
            pb: 3,
          }}
        >
          <PaymentNewCardForm
            numberField={{ name: "paymentMethods.card.number" }}
            holderField={{ name: "paymentMethods.card.holder" }}
            dateField={{ name: "paymentMethods.card.expiration" }}
            cvvField={{ name: "paymentMethods.card.security" }}
          />
        </Box>
      )}
    </Box>
  );
}
