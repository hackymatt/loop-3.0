import type { Language } from "src/locales/types";
import type { GetQueryResponse } from "src/api/types";
import type { PlanType, IPlanProps } from "src/types/plan";

import { compact } from "lodash-es";

import { getSimpleListData } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.PLANS;

type IPricing = {
  currency: "PLN" | "EUR" | "USD" | "GBP";
  interval: "monthly" | "yearly";
  price: number;
};

type IOption = {
  title: string;
  disabled: boolean;
};

type IPlan = {
  type: "free" | "basic" | "premium";
  tokens_limit: number;
  license: string;
  popular: boolean;
  pricing: IPricing[];
  options: IOption[];
};

// Kolejność sortowania typów planów
const planOrder: PlanType[] = ["free", "basic", "premium"];

export const plansQuery = (language: Language) => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<IPlanProps[]>> => {
    const { data } = await getSimpleListData<IPlan>(queryUrl, {
      headers: { "Accept-Language": language },
    });

    const modifiedResults: IPlanProps[] = (data ?? [])
      .map(({ type, tokens_limit, ...rest }: IPlan) => ({
        ...rest,
        type: type as PlanType,
        tokensLimit: tokens_limit,
      }))
      .sort((a, b) => planOrder.indexOf(a.type) - planOrder.indexOf(b.type));

    return { results: modifiedResults };
  };

  return { url, queryFn, queryKey: compact([url]) };
};
