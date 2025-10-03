import type { Language } from "src/locales/types";
import type { IBlogTopicProp } from "src/types/blog";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";

import { URLS } from "src/api/urls";
import { getListData, formatQueryParams } from "src/api/utils";

const endpoint = URLS.POST_TOPICS;

type IBlogTopic = {
  slug: string;
  translated_name: string;
};

export const postTopicsQuery = (language: Language, query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<IBlogTopicProp[]>> => {
    const {
      data: { results, records_count, pages_count },
    } = await getListData<IBlogTopic>(queryUrl, {
      headers: { "Accept-Language": language },
    });
    const modifiedResults: IBlogTopicProp[] = (results ?? []).map(
      ({ translated_name, ...rest }: IBlogTopic) => ({
        ...rest,
        name: translated_name,
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, urlParams]) };
};
