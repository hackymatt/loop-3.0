import type { IInvoiceProps } from "src/types/user";
import type { TableRowProps } from "@mui/material/TableRow";

import { useTranslation } from "react-i18next";
import { usePopover } from "minimal-shared/hooks";

import Popover from "@mui/material/Popover";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import MenuItem, { menuItemClasses } from "@mui/material/MenuItem";
import InputBase, { inputBaseClasses } from "@mui/material/InputBase";

import { fDate } from "src/utils/format-time";
import { fCurrency } from "src/utils/format-number";

import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------

type Props = TableRowProps & {
  row: IInvoiceProps;
};

export function AccountInvoicesTableRow({ row, sx, ...other }: Props) {
  const openOptions = usePopover();

  const { t } = useTranslation("account");

  const inputStyles = {
    borderRadius: 0.75,
    [`& .${inputBaseClasses.input}`]: { pl: 1, typography: "body2" },
    [`&.${inputBaseClasses.focused}`]: { bgcolor: "action.selected" },
  };

  return (
    <>
      <TableRow hover sx={sx} {...other}>
        <TableCell sx={{ px: 1 }}>{row.invoiceNumber}</TableCell>

        <TableCell>{fDate(row.invoiceDate)}</TableCell>

        <TableCell sx={{ px: 1 }}>
          <InputBase value={fCurrency(row.amount, { currency: row.currency })} sx={inputStyles} />
        </TableCell>

        <TableCell align="right" padding="none">
          <IconButton onClick={openOptions.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={openOptions.open}
        anchorEl={openOptions.anchorEl}
        onClose={openOptions.onClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 160, [`& .${menuItemClasses.root}`]: { gap: 1 } } } }}
      >
        <MenuItem
          component="a"
          href={row.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          onClick={openOptions.onClose}
        >
          <Iconify icon="solar:download-linear" /> {t("invoices.button")}
        </MenuItem>
      </Popover>
    </>
  );
}
