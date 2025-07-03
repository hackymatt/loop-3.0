import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.PASSWORD_RESET;

type IPasswordReset = {
  email: string;
};

type IPasswordResetReturn = { data: IPasswordReset; status: number };

export const usePasswordReset = () =>
  useMutation<IPasswordResetReturn, AxiosError, IPasswordReset>(async (variables) => {
    const result = await Api.post(endpoint, variables);
    return {
      status: result.status,
      data: result.data,
    };
  });
