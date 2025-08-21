import type { Language } from "src/locales/types";
import type { QueryType, ListQueryResponse } from "src/api/types";
import type { LevelType, IProjectLevelProp } from "src/types/project";

import { compact } from "lodash-es";

import { URLS } from "src/api/urls";
import { getListData, formatQueryParams } from "src/api/utils";

const endpoint = URLS.PROJECT_LEVELS;

type IProjectLevel = {
  slug: string;
  translated_name: string;
};

export const projectLevelsQuery = (language: Language, query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<IProjectLevelProp[]>> => {
    const {
      data: { results, records_count, pages_count },
    } = await getListData<IProjectLevel>(queryUrl, {
      headers: { "Accept-Language": language },
    });
    const modifiedResults: IProjectLevelProp[] = (results ?? []).map(
      ({ translated_name, slug }: IProjectLevel) => ({
        slug: slug as LevelType,
        name: translated_name,
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, urlParams]) };
};
