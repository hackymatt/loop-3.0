import type { Language } from "src/locales/types";
import type { IReviewItemProp } from "src/types/review";
import type { QueryType, ListQueryResponse } from "src/api/types";

import { compact } from "lodash-es";

import { getListData, formatQueryParams } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.REVIEWS;

type IStudent = {
  first_name: string;
  image: string | null;
};

type IReview = {
  student: IStudent;
  rating: number;
  comment: string;
  created_at: string;
};

export const reviewsQuery = (language: Language, slug: string, query?: QueryType) => {
  const url = `${endpoint}/${slug}`;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<IReviewItemProp[]>> => {
    const {
      data: { results, records_count, pages_count },
    } = await getListData<IReview>(queryUrl, {
      headers: { "Accept-Language": language },
    });
    const modifiedResults: IReviewItemProp[] = (results ?? []).map(
      ({ student, comment, created_at, ...rest }: IReview) => ({
        ...rest,
        student: {
          name: student.first_name,
          avatarUrl: student.image,
        },
        message: comment,
        createdAt: created_at,
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, slug]) };
};
