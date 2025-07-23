import type { GetQueryResponse } from "src/api/types";
import type { IReviewSummaryProps } from "src/types/review";

import { compact } from "lodash-es";

import { getSimpleListData } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.REVIEWS_SUMMARY;

type IReviewSummary = {
  rating: number;
  count: number;
};

export const reviewsSummaryQuery = (slug: string) => {
  const url = endpoint;
  const queryUrl = `${url}/${slug}`;

  const queryFn = async (): Promise<GetQueryResponse<IReviewSummaryProps[]>> => {
    const results = await getSimpleListData<IReviewSummary>(queryUrl);
    return { results };
  };

  return { url, queryFn, queryKey: compact([url, slug]) };
};
