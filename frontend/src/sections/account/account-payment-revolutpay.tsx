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
  revolutPay: {
    isPrimary: boolean;
  };
};

export function AccountPaymentRevolutPay({ id, revolutPay, sx, ...other }: Props) {
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
          RevolutPay
          {revolutPay.isPrimary && (
            <Label color="info" startIcon={<Iconify icon="eva:star-fill" />} sx={{ ml: 1 }}>
              Primary
            </Label>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={openOptions.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Box>
      </Paper>

      <AccountPaymentPopover openOptions={openOptions} id={id} isPrimary={revolutPay.isPrimary} />
    </>
  );
}
