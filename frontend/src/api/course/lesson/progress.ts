import type { AxiosError } from "axios";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { Api } from "src/api/service";

const endpoint = URLS.LESSON_PROGRESS;

type ISubmit = {
  lesson: string;
  answer: string | boolean[];
};

type ISubmitReturn = { data: { answer: string }; status: number };

export const useLessonProgress = () => {
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
        queryClient.invalidateQueries([URLS.LESSON]);
      },
    }
  );
};
