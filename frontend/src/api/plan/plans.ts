import type { Language } from "src/locales/types";
import type { GetQueryResponse } from "src/api/types";
import type { PlanType, IPlanProps } from "src/types/plan";

import { compact } from "lodash-es";

import { getSimpleListData } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.PLANS;

type IPricing = {
  currency: "PLN" | "EUR" | "USD" | "GBP";
  monthly: number;
  yearly: number;
};

type IOption = {
  title: string;
  disabled: boolean;
};

type IPlan = {
  slug: string;
  tokens_limit: number;
  license: string;
  popular: boolean;
  premium: boolean;
  pricing: IPricing[];
  options: IOption[];
};

export const plansQuery = (language: Language) => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<IPlanProps[]>> => {
    const results = await getSimpleListData<IPlan>(queryUrl, {
      headers: { "Accept-Language": language },
    });
    const modifiedResults: IPlanProps[] = (results ?? []).map(
      ({ slug, tokens_limit, ...rest }: IPlan) => ({
        ...rest,
        slug: slug as PlanType,
        tokensLimit: tokens_limit,
      })
    );
    return { results: modifiedResults };
  };

  return { url, queryFn, queryKey: compact([url]) };
};
