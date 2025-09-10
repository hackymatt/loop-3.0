import type { usePopover } from "minimal-shared/hooks";

import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import Popover from "@mui/material/Popover";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";

import { useEditPaymentMethod, useDeletePaymentMethod } from "src/api/me/payment-method";

import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------

type Props = {
  id: string;
  isPrimary: boolean;
  openOptions: ReturnType<typeof usePopover>;
};

export function AccountPaymentPopover({ id, isPrimary, openOptions }: Props) {
  const { t } = useTranslation("account");
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: editPaymentMethod } = useEditPaymentMethod(id);
  const { mutateAsync: deletePaymentMethod } = useDeletePaymentMethod(id);

  const handleSetDefault = async () => {
    try {
      await editPaymentMethod({});
      openOptions.onClose();
    } catch (error) {
      enqueueSnackbar((error as Error).message, { variant: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePaymentMethod({});
      openOptions.onClose();
    } catch (error) {
      enqueueSnackbar((error as Error).message, { variant: "error" });
    }
  };

  return (
    <Popover
      open={openOptions.open}
      anchorEl={openOptions.anchorEl}
      onClose={openOptions.onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem disabled={isPrimary} onClick={handleSetDefault} sx={{ gap: 1 }}>
        <Iconify icon="eva:star-fill" /> {t("payment.setDefault")}
      </MenuItem>

      <Divider sx={{ borderStyle: "dashed", mt: 0.5 }} />

      <MenuItem disabled={isPrimary} onClick={handleDelete} sx={{ gap: 1, color: "error.main" }}>
        <Iconify icon="solar:trash-bin-minimalistic-outline" /> {t("payment.delete")}
      </MenuItem>
    </Popover>
  );
}
