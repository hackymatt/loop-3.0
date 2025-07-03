import type { IBlogProps } from "src/types/blog";
import type { GetQueryResponse } from "src/api/types";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { getData } from "src/api/utils";

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

type ITag = {
  slug: string;
  translated_name: string;
};

type INav = {
  slug: string;
  translated_name: string;
  image: string;
};

type IBlog = {
  slug: string;
  translated_name: string;
  translated_description: string;
  translated_content: string;
  topic: ITopic;
  author: IAuthor;
  tags: ITag[];
  image: string;
  published_at: string;
  duration: number;
  prev: INav | null;
  next: INav | null;
};

export const postQuery = (slug: string) => {
  const url = endpoint;
  const queryUrl = `${url}/${slug}`;

  const queryFn = async (): Promise<GetQueryResponse<IBlogProps>> => {
    const { data } = await getData<IBlog>(queryUrl);
    const {
      translated_name,
      translated_description,
      translated_content,
      topic,
      author,
      tags,
      image,
      published_at,
      prev,
      next,
      ...rest
    } = data;

    const modifiedResult: IBlogProps = {
      ...rest,
      name: translated_name,
      description: translated_description,
      content: translated_content,
      category: {
        slug: topic.slug,
        name: topic.translated_name,
      },
      author: { ...author, name: author.full_name, avatarUrl: author.image },
      tags: tags.map((tag) => ({
        slug: tag.slug,
        name: tag.translated_name,
      })),
      heroUrl: image,
      publishedAt: published_at,
      prevPost: prev
        ? {
            ...prev,
            name: prev.translated_name,
            heroUrl: prev.image,
          }
        : null,
      nextPost: next
        ? {
            ...next,
            name: next.translated_name,
            heroUrl: next.image,
          }
        : null,
    };
    return { results: modifiedResult };
  };

  return { url, queryFn, queryKey: compact([url, slug]) };
};

export const usePost = (slug: string, enabled: boolean = true) => {
  const { queryKey, queryFn } = postQuery(slug);
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return { data: data?.results, ...rest };
};
