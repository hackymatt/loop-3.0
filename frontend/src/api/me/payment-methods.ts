import type { IPaymentMethodProps } from "src/types/user";

import { compact } from "lodash-es";
import { cookies } from "next/headers";

import { URLS } from "../urls";
import { getListData, formatQueryParams } from "../utils";

import type { QueryType, GetQueryResponse } from "../types";

const endpoint = URLS.PAYMENT_METHODS;

type ICard = {
  brand: string;
  display_brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  holder: string;
  wallet: "google_pay" | "apple_pay" | null;
};

type IPaypal = {
  payer_email: string;
};

type IPaymentMethod = {
  id: string;
  type: "card" | "paypal";
  is_default: boolean;
  details: ICard | IPaypal;
};
export const paymentMethodsQuery = (query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<GetQueryResponse<IPaymentMethodProps[]>> => {
    const {
      data: { results },
    } = await getListData<IPaymentMethod>(queryUrl, {
      headers: { Cookie: cookies().toString() },
    });

    const modifiedResults: IPaymentMethodProps[] = (results || []).map((method) => {
      const { id, type, is_default, details } = method;

      return {
        id,
        type,
        isDefault: is_default,
        details:
          type === "card"
            ? {
                brand: (details as ICard).brand,
                holder: (details as ICard).holder,
                last4: (details as ICard).last4,
                expMonth: (details as ICard).exp_month,
                expYear: (details as ICard).exp_year,
                displayBrand: (details as ICard).display_brand,
                wallet: (details as ICard).wallet,
              }
            : { payerEmail: (details as IPaypal).payer_email },
      };
    });

    return { results: modifiedResults };
  };

  return { url, queryFn, queryKey: compact([url]) };
};
