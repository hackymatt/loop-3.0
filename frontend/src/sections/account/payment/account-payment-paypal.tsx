import type { PaperProps } from "@mui/material/Paper";

import { useTranslation } from "react-i18next";
import { usePopover } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Divider } from "@mui/material";
import Typography from "@mui/material/Typography";
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
  const { t } = useTranslation("account");
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
            minHeight: 210,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {/* Header Row */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Paypal
          </Typography>

          {paypal.isPrimary && (
            <Label
              color="info"
              startIcon={<Iconify icon="eva:star-fill" />}
              sx={{ ml: 2, borderRadius: 10, fontSize: "0.75rem", px: 1.5 }}
            >
              {t("payment.default")}
            </Label>
          )}

          <Box sx={{ flexGrow: 1 }} />
          <Iconify width={24} icon="logos:paypal" />
          <IconButton onClick={openOptions.onOpen} size="small">
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Box>

        <Divider />

        {/* Details */}
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {paypal.email}
          </Typography>
        </Box>
      </Paper>

      <AccountPaymentPopover openOptions={openOptions} id={id} isPrimary={paypal.isPrimary} />
    </>
  );
}
