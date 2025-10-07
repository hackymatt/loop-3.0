import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { URLS } from "src/api/urls";
import { Api } from "src/api/service";

const endpoint = URLS.PROJECT_CHANNEL_POSTS;

type IEditPost = { title: string; message: string };

type IEditPostReturn = {
  data: IEditPost;
  status: number;
};

export const useEditPost = (slug: string, id: string, language: Language) => {
  const router = useRouter();
  const url = `${endpoint}/${slug}/${id}`;
  return useMutation<IEditPostReturn, AxiosError, IEditPost>(
    async (variables) => {
      const result = await Api.put(url, variables, {
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

type IDeletePost = {};

type IDeletePostReturn = {
  data: IDeletePost;
  status: number;
};

export const useDeletePost = (slug: string, id: string) => {
  const router = useRouter();
  const url = `${endpoint}/${slug}/${id}`;
  return useMutation<IDeletePostReturn, AxiosError, IDeletePost>(
    async () => {
      const result = await Api.delete(url);
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
