import type { Language } from "src/locales/types";
import type { GetQueryResponse } from "src/api/types";
import type { PlanType, IPlanProps } from "src/types/plan";

import { compact } from "lodash-es";

import { getData } from "src/api/utils";

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
  type: string;
  tokens_limit: number;
  license: string;
  popular: boolean;
  pricing: IPricing[];
  options: IOption[];
};

export const planQuery = (language: Language, type: string) => {
  const url = endpoint;
  const queryUrl = `${url}/${type}`;

  const queryFn = async (): Promise<GetQueryResponse<IPlanProps>> => {
    const { data } = await getData<IPlan>(queryUrl, {
      headers: { "Accept-Language": language },
    });
    const { type: planType, tokens_limit, ...rest }: IPlan = data;

    const modifiedResults: IPlanProps = {
      ...rest,
      type: planType as PlanType,
      tokensLimit: tokens_limit,
    };
    return { results: modifiedResults };
  };

  return { url, queryFn, queryKey: compact([url, type]) };
};
