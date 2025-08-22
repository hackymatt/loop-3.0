import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { URLS } from "src/api/urls";
import { Api } from "src/api/service";

const endpoint = URLS.PROJECT_CHANNEL_POST_COMMENTS;

type IEditPostComment = { title: string; message: string };

type IEditPostCommentReturn = {
  data: IEditPostComment;
  status: number;
};

export const useEditPostComment = (id: string) => {
  const url = `${endpoint}/${id}`;
  return useMutation<IEditPostCommentReturn, AxiosError, IEditPostComment>(async (variables) => {
    const result = await Api.put(url, variables);
    return {
      status: result.status,
      data: result.data,
    };
  });
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
