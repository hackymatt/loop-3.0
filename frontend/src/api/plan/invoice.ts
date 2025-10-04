import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.PREVIEW_INVOICE;

type IInvoice = {
  plan: string;
  currency: string;
  interval: string;
};

type IInvoiceReturn = {
  data: { amount_due: number; billing_date: string };
  status: number;
};

export const useInvoicePreview = () =>
  useMutation<IInvoiceReturn, AxiosError, IInvoice>(async (variables) => {
    const result = await Api.post(endpoint, variables);
    return {
      status: result.status,
      data: result.data,
    };
  });
