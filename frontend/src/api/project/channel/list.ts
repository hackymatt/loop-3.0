import type { Language } from "src/locales/types";
import type { IChannelItemProp } from "src/types/channel";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";
import { cookies } from "next/headers";

import { URLS } from "src/api/urls";
import { getListData, formatQueryParams } from "src/api/utils";

const endpoint = URLS.PROJECT_CHANNEL_POSTS;

type IStudent = {
  first_name: string;
  image: string | null;
};

type IChannelPostComment = {
  id: string;
  student: IStudent;
  message: string;
  is_mine: boolean;
  created_at: string;
};

type IChannelPost = {
  id: string;
  title: string;
  student: IStudent;
  message: string;
  helpful_count: number;
  is_helpful: boolean;
  is_mine: boolean;
  created_at: string;
  comments: IChannelPostComment[];
};

export const channelPostsQuery = (language: Language, slug: string, query?: QueryType) => {
  const url = `${endpoint}/${slug}`;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<IChannelItemProp[]>> => {
    const {
      data: { results, records_count, pages_count },
      error,
    } = await getListData<IChannelPost>(queryUrl, {
      headers: { "Accept-Language": language, Cookie: cookies().toString() },
    });
    const modifiedResults: IChannelItemProp[] = (results ?? []).map(
      ({
        student,
        helpful_count,
        is_helpful,
        is_mine,
        created_at,
        comments,
        ...rest
      }: IChannelPost) => ({
        ...rest,
        student: {
          name: student.first_name,
          avatarUrl: student.image,
        },
        helpfulCount: helpful_count,
        isHelpful: is_helpful,
        isMine: is_mine,
        createdAt: created_at,
        comments: comments.map(
          ({
            student: commentStudent,
            created_at: commentCreatedAt,
            is_mine: commentIsMine,
            ...commentRest
          }: IChannelPostComment) => ({
            ...commentRest,
            student: {
              name: commentStudent.first_name,
              avatarUrl: commentStudent.image,
            },
            isMine: commentIsMine,
            createdAt: commentCreatedAt,
          })
        ),
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count, error };
  };

  return { url, queryFn, queryKey: compact([url, slug]) };
};
