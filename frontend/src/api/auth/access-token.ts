import type { GetQueryResponse } from "src/api/types";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { getData } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.ACCESS_TOKEN;

type IToken = {
  token: string;
};

export const accessTokenQuery = () => {
  const url = endpoint;

  const queryFn = async (): Promise<GetQueryResponse<IToken>> => {
    const { data } = await getData<IToken>(url);

    return { results: data };
  };

  return { url, queryFn, queryKey: compact([url]) };
};

export const useAccessToken = (enabled: boolean = true) => {
  const { queryKey, queryFn } = accessTokenQuery();
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return { data: data?.results, ...rest };
};
