import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

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

export const useInvoicePreview = (language: Language) =>
  useMutation<IInvoiceReturn, AxiosError, IInvoice>(async (variables) => {
    const result = await Api.post(endpoint, variables, {
      headers: { "Accept-Language": language },
    });
    return {
      status: result.status,
      data: result.data,
    };
  });
