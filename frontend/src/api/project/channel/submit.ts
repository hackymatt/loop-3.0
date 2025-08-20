import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { Api } from "src/api/service";

const endpoint = URLS.PROJECT_CHANNEL_SUBMIT;

type ISubmit = {
  slug: string;
  title: string;
  message: string;
};

type ISubmitReturn = { data: ISubmit; status: number };

export const useChannelSubmit = () =>
  useMutation<ISubmitReturn, AxiosError, ISubmit>(async (variables) => {
    const result = await Api.post(endpoint, variables);
    return {
      status: result.status,
      data: result.data,
    };
  });
