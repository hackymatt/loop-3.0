import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.ACTIVATE;

type IActivate = {
  token: string;
};

type IActivateReturn = { data: { email: string }; status: number };

export const useActivate = () =>
  useMutation<IActivateReturn, AxiosError, IActivate>(async (variables) => {
    const result = await Api.post(endpoint, variables);
    return {
      status: result.status,
      data: result.data,
    };
  });
