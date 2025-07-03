import type { AxiosError } from "axios";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { Api } from "src/api/service";

const endpoint = URLS.REVIEW_SUBMIT;

type ISubmit = {
  slug: string;
  rating: number;
  comment: string | null;
};

type ISubmitReturn = { data: ISubmit; status: number };

export const useReviewSubmit = () => {
  const queryClient = useQueryClient();

  return useMutation<ISubmitReturn, AxiosError, ISubmit>(
    async (variables) => {
      const result = await Api.post(endpoint, variables);
      return {
        status: result.status,
        data: result.data,
      };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([URLS.REVIEWS]);
        queryClient.invalidateQueries([URLS.REVIEWS_SUMMARY]);
        queryClient.invalidateQueries([URLS.COURSES]);
        queryClient.invalidateQueries([URLS.FEATURED_REVIEWS]);
      },
    }
  );
};
