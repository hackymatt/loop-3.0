import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { URLS } from "src/api/urls";
import { ClientApi } from "src/api/service";

const endpoint = URLS.PROJECT_CHANNEL_POST_COMMENTS;

type IEditPostComment = { message: string };

type IEditPostCommentReturn = {
  data: IEditPostComment;
  status: number;
};

export const useEditPostComment = (
  slug: string,
  postId: string,
  commentId: string,
  language: Language
) => {
  const router = useRouter();
  const url = `${endpoint}/${slug}/${postId}/${commentId}`;
  return useMutation<IEditPostCommentReturn, AxiosError, IEditPostComment>(
    async (variables) => {
      const result = await ClientApi.put(url, variables, {
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

type IDeletePostComment = {};

type IDeletePostCommentReturn = {
  data: IDeletePostComment;
  status: number;
};

export const useDeletePostComment = (slug: string, postId: string, commentId: string) => {
  const router = useRouter();
  const url = `${endpoint}/${slug}/${postId}/${commentId}`;
  return useMutation<IDeletePostCommentReturn, AxiosError, IDeletePostComment>(
    async () => {
      const result = await ClientApi.delete(url);
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
