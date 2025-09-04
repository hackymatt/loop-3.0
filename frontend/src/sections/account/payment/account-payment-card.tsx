import type { PaperProps } from "@mui/material/Paper";

import { useTranslation } from "react-i18next";
import { usePopover } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import { Label } from "src/components/label";
import { Iconify } from "src/components/iconify";

import { AccountPaymentPopover } from "./account-payment-popover";

// ----------------------------------------------------------------------

type Props = PaperProps & {
  id: string;
  card: {
    value: string;
    label: string;
    number: string;
    holder: string;
    expired: string;
    isPrimary: boolean;
  };
};

export function AccountPaymentCard({ id, card, sx, ...other }: Props) {
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
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {card.label.charAt(0).toUpperCase() + card.label.slice(1)}
          </Typography>

          {card.isPrimary && (
            <Label
              color="info"
              startIcon={<Iconify icon="eva:star-fill" />}
              sx={{ ml: 1, fontWeight: "medium" }}
            >
              {t("payment.default")}
            </Label>
          )}

          <Box sx={{ flexGrow: 1 }} />
          <Iconify width={28} icon={`logos:${card.value.replace("_", "-")}`} />
          <IconButton onClick={openOptions.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Box>

        {/* Card Number */}
        <Box sx={{ gap: 1, display: "flex", alignItems: "center", typography: "h6" }}>
          {`**** **** **** ${card.number}`}
        </Box>

        {/* Card Details */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ mb: 0.5, color: "text.secondary", display: "block" }}
            >
              {t("payment.card.holder")}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {card.holder}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ mb: 0.5, color: "text.secondary", display: "block" }}
            >
              {t("payment.card.expiration")}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {card.expired}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Popover Menu */}
      <AccountPaymentPopover openOptions={openOptions} id={id} isPrimary={card.isPrimary} />
    </>
  );
}
