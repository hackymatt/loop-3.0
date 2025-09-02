import type { PaperProps } from "@mui/material/Paper";

import { usePopover } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";

import { Label } from "src/components/label";
import { Iconify } from "src/components/iconify";

import { AccountPaymentPopover } from "./account-payment-popover";

// ----------------------------------------------------------------------

type Props = PaperProps & {
  id: string;
  paypal: {
    email: string;
    isPrimary: boolean;
  };
};

export function AccountPaymentPaypal({ id, paypal, sx, ...other }: Props) {
  const openOptions = usePopover();

  return (
    <>
      <Paper
        variant="outlined"
        sx={[
          {
            p: 3,
            pr: 1,
            gap: 3,
            borderRadius: 2,
            display: "flex",
            bgcolor: "transparent",
            flexDirection: "column",
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <Box sx={{ display: "flex", alignItems: "center", typography: "subtitle1" }}>
          PayPal
          {paypal.isPrimary && (
            <Label color="info" startIcon={<Iconify icon="eva:star-fill" />} sx={{ ml: 1 }}>
              Primary
            </Label>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Iconify width={24} icon="logos:paypal" />
          <IconButton onClick={openOptions.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Box>

        <Box sx={{ gap: 1, display: "flex", alignItems: "center", typography: "h6" }}>
          {paypal.email}
        </Box>
      </Paper>

      <AccountPaymentPopover openOptions={openOptions} id={id} isPrimary={paypal.isPrimary} />
    </>
  );
}
