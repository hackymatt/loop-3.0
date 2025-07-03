import type { GetQueryResponse } from "src/api/types";
import type { ITestimonialProps } from "src/types/testimonial";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { getSimpleListData } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.FEATURED_REVIEWS;

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

export const featuredReviewsQuery = () => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<ITestimonialProps[]>> => {
    const results = await getSimpleListData<IReview>(queryUrl);
    const modifiedResults: ITestimonialProps[] = (results ?? []).map(
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
    return { results: modifiedResults };
  };

  return { url, queryFn, queryKey: compact([url]) };
};

export const useFeaturedReviews = (enabled: boolean = true) => {
  const { queryKey, queryFn } = featuredReviewsQuery();
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return {
    data: data?.results,
    ...rest,
  };
};
