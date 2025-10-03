import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { URLS } from "src/api/urls";
import { Api } from "src/api/service";

const endpoint = URLS.PROJECT_CHANNEL_POSTS;

type ICreatePost = {
  title: string;
  message: string;
};

type ICreatePostReturn = { data: ICreatePost; status: number };

export const useCreatePost = (slug: string) => {
  const router = useRouter();
  const url = `${endpoint}/${slug}`;
  return useMutation<ICreatePostReturn, AxiosError, ICreatePost>(
    async (variables) => {
      const result = await Api.post(url, variables);
      return { status: result.status, data: result.data };
    },
    {
      onSuccess: () => {
        router.refresh();
      },
    }
  );
};
