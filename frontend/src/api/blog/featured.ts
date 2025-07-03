import type { GetQueryResponse } from "src/api/types";
import type { IBlogFeaturedPost } from "src/types/blog";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { getSimpleListData } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.FEATURED_POST;

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

export const featuredPostsQuery = () => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<IBlogFeaturedPost[]>> => {
    const results = await getSimpleListData<IBlog>(queryUrl);

    const modifiedResults: IBlogFeaturedPost[] = results.map(
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
    return { results: modifiedResults };
  };

  return { url, queryFn, queryKey: compact([url]) };
};

export const useFeaturedPosts = (enabled: boolean = true) => {
  const { queryKey, queryFn } = featuredPostsQuery();
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return {
    data: data?.results,
    ...rest,
  };
};
