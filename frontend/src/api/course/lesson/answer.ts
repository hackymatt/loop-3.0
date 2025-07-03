import type { AxiosError } from "axios";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { Api } from "src/api/service";

const endpoint = URLS.LESSON_ANSWER;

type IAnswer = {
  lesson: string;
};

type IAnswerReturn = { data: { answer: string | boolean[] }; status: number };

export const useLessonAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation<IAnswerReturn, AxiosError, IAnswer>(
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
        queryClient.invalidateQueries([URLS.COURSES]);
        queryClient.invalidateQueries([URLS.DASHBOARD]);
      },
    }
  );
};
