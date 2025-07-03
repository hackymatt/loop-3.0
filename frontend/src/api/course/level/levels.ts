import type { QueryType, ListQueryResponse } from "src/api/types";
import type { LevelType, ICourseLevelProp } from "src/types/course";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { getListData, formatQueryParams } from "src/api/utils";

const endpoint = URLS.COURSE_LEVELS;

type ICourseLevel = {
  slug: string;
  translated_name: string;
};

export const courseLevelsQuery = (query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<ICourseLevelProp[]>> => {
    const { results, records_count, pages_count } = await getListData<ICourseLevel>(queryUrl);
    const modifiedResults: ICourseLevelProp[] = (results ?? []).map(
      ({ translated_name, slug }: ICourseLevel) => ({
        slug: slug as LevelType,
        name: translated_name,
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, urlParams]) };
};

export const useCourseLevels = (query?: QueryType, enabled: boolean = true) => {
  const { queryKey, queryFn } = courseLevelsQuery(query);
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return { data: data?.results, count: data?.count, ...rest };
};
