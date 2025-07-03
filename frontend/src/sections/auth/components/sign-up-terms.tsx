import type { BoxProps } from "@mui/material/Box";

import Box from "@mui/material/Box";

import { useTermsAcceptance, useDataProcessingConsent } from "src/consts/acceptances";

import { Field } from "src/components/hook-form";

// ----------------------------------------------------------------------

export function SignUpTerms({ sx, ...other }: BoxProps) {
  const termsAcceptance = useTermsAcceptance();
  const dataProcessingConsent = useDataProcessingConsent();
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
      <Field.Checkbox name="termsAcceptance" label={termsAcceptance} />
      <Field.Checkbox
        name="dataProcessingConsent"
        label={dataProcessingConsent}
        sx={{ alignItems: "flex-start" }}
      />
    </Box>
  );
}
