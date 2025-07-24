import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { Api } from "src/api/service";

const endpoint = URLS.REVIEW_SUBMIT;

type ISubmit = {
  slug: string;
  rating: number;
  comment: string | null;
};

type ISubmitReturn = { data: ISubmit; status: number };

export const useReviewSubmit = () =>
  useMutation<ISubmitReturn, AxiosError, ISubmit>(async (variables) => {
    const result = await Api.post(endpoint, variables);
    return {
      status: result.status,
      data: result.data,
    };
  });
