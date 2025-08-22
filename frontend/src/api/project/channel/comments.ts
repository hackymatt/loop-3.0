import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { URLS } from "src/api/urls";
import { Api } from "src/api/service";

const endpoint = URLS.PROJECT_CHANNEL_POST_COMMENTS;

type ICreatePostComment = {
  post_id: string;
  message: string;
};

type ICreatePostCommentReturn = { data: ICreatePostComment; status: number };

export const useCreatePostComment = (slug: string) => {
  const router = useRouter();
  const url = `${endpoint}/${slug}`;
  return useMutation<ICreatePostCommentReturn, AxiosError, ICreatePostComment>(
    async (variables) => {
      const result = await Api.post(url, variables);
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
