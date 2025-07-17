import type { Language } from "src/locales/types";
import type { IProjectTechnologyProp } from "src/types/project";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";

import { URLS } from "src/api/urls";
import { getListData, formatQueryParams } from "src/api/utils";

const endpoint = URLS.COURSE_TECHNOLOGIES;

type IProjectTechnology = {
  slug: string;
  name: string;
};

export const projectTechnologiesQuery = (language: Language, query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<IProjectTechnologyProp[]>> => {
    const { results, records_count, pages_count } = await getListData<IProjectTechnology>(
      queryUrl,
      {
        headers: { "Accept-Language": language },
      }
    );
    return { results, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, urlParams]) };
};
