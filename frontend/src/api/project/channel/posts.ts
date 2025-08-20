import type { Language } from "src/locales/types";
import type { ListQueryResponse } from "src/api/types";
import type { IChannelItemProp } from "src/types/channel";

import { compact } from "lodash-es";

import { URLS } from "src/api/urls";
import { getListData } from "src/api/utils";

const endpoint = URLS.PROJECT_CHANNEL;

type IStudent = {
  first_name: string;
  image: string | null;
};

type IChannelPostComment = {
  id: string;
  student: IStudent;
  message: string;
  created_at: string;
};

type IChannelPost = {
  id: string;
  title: string;
  student: IStudent;
  message: string;
  helpful_count: number;
  is_helpful: boolean;
  created_at: string;
  comments: IChannelPostComment[];
};

export const channelPostsQuery = (language: Language, slug: string) => {
  const url = endpoint;
  const queryUrl = `${url}/${slug}`;

  const queryFn = async (): Promise<ListQueryResponse<IChannelItemProp[]>> => {
    const { results, records_count, pages_count } = await getListData<IChannelPost>(queryUrl, {
      headers: { "Accept-Language": language },
    });
    const modifiedResults: IChannelItemProp[] = (results ?? []).map(
      ({ student, helpful_count, is_helpful, created_at, comments, ...rest }: IChannelPost) => ({
        ...rest,
        student: {
          name: student.first_name,
          avatarUrl: student.image,
        },
        helpfulCount: helpful_count,
        isHelpful: is_helpful,
        createdAt: created_at,
        comments: comments.map(
          ({
            student: commentStudent,
            created_at: commentCreatedAt,
            ...commentRest
          }: IChannelPostComment) => ({
            ...commentRest,
            student: {
              name: commentStudent.first_name,
              avatarUrl: commentStudent.image,
            },
            createdAt: commentCreatedAt,
          })
        ),
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, slug]) };
};
