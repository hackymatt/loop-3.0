import type { Language } from "src/locales/types";
import type { IInvoiceProps } from "src/types/user";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";
import { cookies } from "next/headers";

import { getListData, formatQueryParams } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.INVOICES;

type IInvoice = {
  invoice_number: string;
  invoice_date: string;
  amount: number;
  currency: "PLN" | "EUR" | "USD" | "GBP";
  url: string;
};

export const invoiceQuery = (language: Language, query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<IInvoiceProps[]>> => {
    const {
      data: { results, records_count, pages_count },
    } = await getListData<IInvoice>(queryUrl, {
      headers: { "Accept-Language": language, Cookie: cookies().toString() },
    });
    const modifiedResults: IInvoiceProps[] = (results ?? []).map(
      ({ invoice_number, invoice_date, ...rest }: IInvoice) => ({
        ...rest,
        invoiceNumber: invoice_number,
        invoiceDate: invoice_date,
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url]) };
};
