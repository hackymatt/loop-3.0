import type { Language } from "src/locales/types";
import type { IProjectTagProp } from "src/types/project";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";

import { URLS } from "src/api/urls";
import { getListData, formatQueryParams } from "src/api/utils";

const endpoint = URLS.PROJECT_TAGS;

type IProjectTag = {
  slug: string;
  translated_name: string;
};

export const projectTagsQuery = (language: Language, query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<IProjectTagProp[]>> => {
    const {
      data: { results, records_count, pages_count },
    } = await getListData<IProjectTag>(queryUrl, {
      headers: { "Accept-Language": language },
    });
    const modifiedResults: IProjectTagProp[] = (results ?? []).map(
      ({ translated_name, ...rest }: IProjectTag) => ({
        ...rest,
        name: translated_name,
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, urlParams]) };
};
