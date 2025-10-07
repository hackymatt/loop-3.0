import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { URLS } from "src/api/urls";
import { ClientApi } from "src/api/service";

const endpoint = URLS.REVIEW_SUBMIT;

type ISubmit = {
  slug: string;
  rating: number;
  comment: string | null;
};

type ISubmitReturn = { data: ISubmit; status: number };

export const useReviewSubmit = (language: Language) => {
  const router = useRouter();

  return useMutation<ISubmitReturn, AxiosError, ISubmit>(
    async (variables) => {
      const result = await ClientApi.post(endpoint, variables, {
        headers: { "Accept-Language": language },
      });
      return {
        status: result.status,
        data: result.data,
      };
    },
    {
      onSuccess: () => {
        router.refresh();
      },
    }
  );
};
