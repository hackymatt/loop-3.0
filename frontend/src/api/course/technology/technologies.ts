import type { ICourseTechnologyProp } from "src/types/course";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { getListData, formatQueryParams } from "src/api/utils";

const endpoint = URLS.COURSE_TECHNOLOGIES;

type ICourseTechnology = {
  slug: string;
  name: string;
};

export const courseTechnologiesQuery = (query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<ICourseTechnologyProp[]>> => {
    const { results, records_count, pages_count } = await getListData<ICourseTechnology>(queryUrl);
    return { results, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, urlParams]) };
};

export const useCourseTechnologies = (query?: QueryType, enabled: boolean = true) => {
  const { queryKey, queryFn } = courseTechnologiesQuery(query);
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return { data: data?.results, count: data?.count, ...rest };
};
