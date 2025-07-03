import type { IBlogListProps } from "src/types/blog";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { getListData, formatQueryParams } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.POSTS;

type ITopic = {
  slug: string;
  translated_name: string;
};

type IAuthor = {
  full_name: string;
  image: string | null;
  role: string;
};

type IBlog = {
  slug: string;
  translated_name: string;
  translated_description: string;
  topic: ITopic;
  author: IAuthor;
  image: string;
  published_at: string;
  duration: number;
};

export const postsQuery = (query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<IBlogListProps[]>> => {
    const { results, records_count, pages_count } = await getListData<IBlog>(queryUrl);
    const modifiedResults: IBlogListProps[] = (results ?? []).map(
      ({
        translated_name,
        translated_description,
        topic,
        author,
        image,
        published_at,
        ...rest
      }: IBlog) => ({
        ...rest,
        name: translated_name,
        description: translated_description,
        category: {
          slug: topic.slug,
          name: topic.translated_name,
        },
        author: { ...author, name: author.full_name, avatarUrl: author.image },
        heroUrl: image,
        publishedAt: published_at,
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, urlParams]) };
};

export const usePosts = (query?: QueryType, enabled: boolean = true) => {
  const { queryKey, queryFn } = postsQuery(query);
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return {
    data: data?.results,
    count: data?.count,
    pageSize: data?.pagesCount,
    ...rest,
  };
};
