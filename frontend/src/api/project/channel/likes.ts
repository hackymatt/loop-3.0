import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { URLS } from "src/api/urls";
import { Api } from "src/api/service";

const endpoint = URLS.PROJECT_CHANNEL_POST_LIKES;

type ICreatePostLike = {
  post_id: string;
};

type ICreatePostLikeReturn = { data: ICreatePostLike; status: number };

export const useLikePost = (slug: string) => {
  const router = useRouter();
  const url = `${endpoint}/${slug}`;
  return useMutation<ICreatePostLikeReturn, AxiosError, ICreatePostLike>(
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
