import type { Language } from "src/locales/types";
import type { GetQueryResponse } from "src/api/types";
import type { ISubscriptionProps } from "src/types/user";

import { compact } from "lodash-es";
import { cookies } from "next/headers";

import { getData } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.SUBSCRIPTION;

type ISubscription = {
  type: "free" | "basic" | "premium";
  license: string;
  interval: "monthly" | "yearly" | null;
  next_billing_date: string | null;
  price: number | null;
  currency: "PLN" | "EUR" | "GBP" | "USD" | null;
  status:
    | "trialing"
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "unpaid";
  cancel_at_period_end: boolean | null;
};

export const subscriptionQuery = (language: Language) => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<ISubscriptionProps>> => {
    const { data } = await getData<ISubscription>(queryUrl, {
      headers: { "Accept-Language": language, Cookie: cookies().toString() },
    });

    const { next_billing_date, cancel_at_period_end, ...rest } = data;

    const modifiedResult: ISubscriptionProps = {
      ...rest,
      nextBillingDate: next_billing_date,
      isCancelAtPeriodEnd: cancel_at_period_end,
    };

    return { results: modifiedResult };
  };

  return { url, queryFn, queryKey: compact([url]) };
};
