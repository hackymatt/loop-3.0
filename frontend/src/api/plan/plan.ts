import type { GetQueryResponse } from "src/api/types";
import type { PlanType, IPlanProps } from "src/types/plan";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { getData } from "src/api/utils";

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

export const planQuery = (slug: string) => {
  const url = endpoint;
  const queryUrl = `${url}/${slug}`;

  const queryFn = async (): Promise<GetQueryResponse<IPlanProps>> => {
    const { data } = await getData<IPlan>(queryUrl);
    const { slug: planSlug, ...rest }: IPlan = data;

    const modifiedResults: IPlanProps = {
      ...rest,
      slug: planSlug as PlanType,
    };
    return { results: modifiedResults };
  };

  return { url, queryFn, queryKey: compact([url, slug]) };
};

export const usePlan = (slug: string, enabled: boolean = true) => {
  const { queryKey, queryFn } = planQuery(slug);
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return {
    data: data?.results,
    ...rest,
  };
};
