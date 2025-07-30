import type { Language } from "src/locales/types";
import type { GetQueryResponse } from "src/api/types";
import type { IProjectTechnologyProp } from "src/types/project";

import { compact } from "lodash-es";

import { URLS } from "src/api/urls";
import { getSimpleListData } from "src/api/utils";

const endpoint = URLS.FEATURED_TECHNOLOGIES;

type IProjectTechnology = {
  slug: string;
  name: string;
};

export const featuredTechnologiesQuery = (language: Language) => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<IProjectTechnologyProp[]>> => {
    const results = await getSimpleListData<IProjectTechnology>(queryUrl, {
      headers: { "Accept-Language": language },
    });
    return { results };
  };

  return { url, queryFn, queryKey: compact([url]) };
};
