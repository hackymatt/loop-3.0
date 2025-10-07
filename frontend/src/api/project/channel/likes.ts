import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { URLS } from "src/api/urls";
import { ClientApi } from "src/api/service";

const endpoint = URLS.PROJECT_CHANNEL_POST_LIKES;

type ICreatePostLike = {
  post_id: string;
};

type ICreatePostLikeReturn = { data: ICreatePostLike; status: number };

export const useLikePost = (slug: string, language: Language) => {
  const router = useRouter();
  const url = `${endpoint}/${slug}`;
  return useMutation<ICreatePostLikeReturn, AxiosError, ICreatePostLike>(
    async (variables) => {
      const result = await ClientApi.post(url, variables, {
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
