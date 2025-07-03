import type { IBlogTopicProp } from "src/types/blog";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { getListData, formatQueryParams } from "src/api/utils";

const endpoint = URLS.POST_TOPICS;

type IBlogTopic = {
  slug: string;
  translated_name: string;
};

export const postTopicsQuery = (query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<IBlogTopicProp[]>> => {
    const { results, records_count, pages_count } = await getListData<IBlogTopic>(queryUrl);
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

export const usePostTopics = (query?: QueryType, enabled: boolean = true) => {
  const { queryKey, queryFn } = postTopicsQuery(query);
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return { data: data?.results, count: data?.count, ...rest };
};
