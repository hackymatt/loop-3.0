import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.PASSWORD_RESET;

type IPasswordReset = {
  email: string;
};

type IPasswordResetReturn = { data: IPasswordReset; status: number };

export const usePasswordReset = (language: Language) =>
  useMutation<IPasswordResetReturn, AxiosError, IPasswordReset>(async (variables) => {
    const result = await Api.post(endpoint, variables, {
      headers: { "Accept-Language": language },
    });
    return {
      status: result.status,
      data: result.data,
    };
  });
