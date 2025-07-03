import type { BoxProps } from "@mui/material/Box";

import Box from "@mui/material/Box";

import { useTermsAcceptance } from "src/consts/acceptances";

import { Field } from "src/components/hook-form";

// ----------------------------------------------------------------------

export function PaymentTerms({ sx, ...other }: BoxProps) {
  const termsAcceptance = useTermsAcceptance();
  return (
    <Box
      component="span"
      sx={[
        {
          mt: 3,
          display: "block",
          textAlign: "left",
          typography: "caption",
          color: "text.secondary",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Field.Checkbox name="summary.termsAcceptance" label={termsAcceptance} />
    </Box>
  );
}
