import type { Language } from "src/locales/types";
import type { IProjectCategoryProp } from "src/types/project";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";

import { URLS } from "src/api/urls";
import { getListData, formatQueryParams } from "src/api/utils";

const endpoint = URLS.COURSE_CATEGORIES;

type IProjectCategory = {
  slug: string;
  translated_name: string;
};

export const projectCategoriesQuery = (language: Language, query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<IProjectCategoryProp[]>> => {
    const { results, records_count, pages_count } = await getListData<IProjectCategory>(queryUrl, {
      headers: { "Accept-Language": language },
    });
    const modifiedResults: IProjectCategoryProp[] = (results ?? []).map(
      ({ translated_name, ...rest }: IProjectCategory) => ({
        ...rest,
        name: translated_name,
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, urlParams]) };
};
