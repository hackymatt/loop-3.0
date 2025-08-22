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
  interval: "monthly" | "yearly";
  valid_to: string;
  price: number;
  currency: "PLN" | "EUR" | "GBP" | "USD";
};

export const subscriptionQuery = (language: Language) => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<ISubscriptionProps>> => {
    const { data } = await getData<ISubscription>(queryUrl, {
      headers: { "Accept-Language": language, Cookie: cookies().toString() },
    });

    const { valid_to, ...rest } = data;

    const modifiedResult: ISubscriptionProps = {
      ...rest,
      validTo: valid_to,
    };

    return { results: modifiedResult };
  };

  return { url, queryFn, queryKey: compact([url]) };
};
