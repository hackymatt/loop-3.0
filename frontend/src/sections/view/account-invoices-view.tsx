"use client";

import type { IInvoiceProps } from "src/types/user";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow, { tableRowClasses } from "@mui/material/TableRow";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";

import { useQueryParams } from "src/hooks/use-query-params";

import { AccountInvoicesTableRow } from "../account/account-invoices-table-row";
import { AccountInvoicesTableHead } from "../account/account-invoices-table-head";

// ----------------------------------------------------------------------
type AccountInvoicesViewProps = {
  data: {
    invoices: IInvoiceProps[];
    invoicesCount: number;
    invoicesPageSize: number;
  };
};

export function AccountInvoicesView({ data }: AccountInvoicesViewProps) {
  const { handleChange, query } = useQueryParams();

  const { t } = useTranslation("account");

  const { invoices, invoicesCount } = data;

  const TABLE_HEAD = [
    { id: "invoice_number", label: t("invoices.invoice_number") },
    { id: "invoice_date", label: t("invoices.invoice_date") },
    { id: "amount", label: t("invoices.amount") },
    { id: "" },
  ];

  const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, { label: t("invoices.all"), value: -1 }];

  const page = Number(query.page) || 1;
  const rowsPerPage = query?.page_size ? parseInt(query?.page_size, 10) : 10;
  const orderBy = query?.sort_by ? query.sort_by.replace("-", "") : "-invoice_date";
  const order = query?.sort_by && query.sort_by.startsWith("-") ? "desc" : "asc";
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - invoicesCount) : 0;

  const handleSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === "asc";
      handleChange("sort_by", isAsc ? `-${id}` : id);
    },
    [handleChange, order, orderBy]
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleChange("page_size", event.target.value);
      handleChange("page", String(1));
    },
    [handleChange]
  );

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {t("invoices.title")}
      </Typography>

      <TableContainer
        sx={(theme) => ({
          [`& .${tableCellClasses.head}`]: { color: "text.primary", bgcolor: "transparent" },
          [`& .${tableRowClasses.root}`]: {
            [`& .${tableCellClasses.root}:first-of-type`]: { p: 0 },
            "&:last-of-type": {
              [`& .${tableCellClasses.root}`]: { borderColor: theme.vars.palette.divider },
            },
          },
        })}
      >
        <Table sx={{ minWidth: 720 }} size="small">
          <AccountInvoicesTableHead
            order={order}
            orderBy={orderBy}
            onSort={handleSort}
            headCells={TABLE_HEAD}
            rowCount={invoicesCount}
          />

          <TableBody>
            {invoices.map((row) => (
              <AccountInvoicesTableRow key={row.invoiceNumber} row={row as IInvoiceProps} />
            ))}

            {emptyRows > 0 && (
              <TableRow sx={{ height: 36 * emptyRows }}>
                <TableCell colSpan={9} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
        <TablePagination
          page={page - 1}
          component="div"
          count={invoicesCount}
          labelRowsPerPage={t("invoices.rows_per_page")}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, selectedPage) => handleChange("page", String(selectedPage + 1))}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </>
  );
}
