import type { ICourseCategoryProp } from "src/types/course";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { getListData, formatQueryParams } from "src/api/utils";

const endpoint = URLS.COURSE_CATEGORIES;

type ICourseCategory = {
  slug: string;
  translated_name: string;
};

export const courseCategoriesQuery = (query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<ICourseCategoryProp[]>> => {
    const { results, records_count, pages_count } = await getListData<ICourseCategory>(queryUrl);
    const modifiedResults: ICourseCategoryProp[] = (results ?? []).map(
      ({ translated_name, ...rest }: ICourseCategory) => ({
        ...rest,
        name: translated_name,
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, urlParams]) };
};

export const useCourseCategories = (query?: QueryType, enabled: boolean = true) => {
  const { queryKey, queryFn } = courseCategoriesQuery(query);
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return { data: data?.results, count: data?.count, ...rest };
};
