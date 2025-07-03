import type { GetQueryResponse } from "src/api/types";
import type { PlanType, IPlanProps } from "src/types/plan";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { getSimpleListData } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.PLANS;

type IPrice = {
  monthly: number;
  yearly: number;
};

type IOption = {
  title: string;
  disabled: boolean;
};

type IPlan = {
  slug: string;
  license: string;
  popular: boolean;
  premium: boolean;
  price: IPrice;
  options: IOption[];
};

export const plansQuery = () => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<IPlanProps[]>> => {
    const results = await getSimpleListData<IPlan>(queryUrl);
    const modifiedResults: IPlanProps[] = (results ?? []).map(({ slug, ...rest }: IPlan) => ({
      ...rest,
      slug: slug as PlanType,
    }));
    return { results: modifiedResults };
  };

  return { url, queryFn, queryKey: compact([url]) };
};

export const usePlans = (enabled: boolean = true) => {
  const { queryKey, queryFn } = plansQuery();
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return {
    data: data?.results,
    ...rest,
  };
};
