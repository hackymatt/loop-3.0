import type { GetQueryResponse } from "src/api/types";
import type { ICourseTechnologyProp } from "src/types/course";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { getSimpleListData } from "src/api/utils";

const endpoint = URLS.FEATURED_TECHNOLOGIES;

type ICourseTechnology = {
  slug: string;
  name: string;
};

export const featuredTechnologiesQuery = () => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<ICourseTechnologyProp[]>> => {
    const results = await getSimpleListData<ICourseTechnology>(queryUrl);
    return { results };
  };

  return { url, queryFn, queryKey: compact([url]) };
};

export const useFeaturedTechnologies = (enabled: boolean = true) => {
  const { queryKey, queryFn } = featuredTechnologiesQuery();
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return {
    data: data?.results,
    ...rest,
  };
};
