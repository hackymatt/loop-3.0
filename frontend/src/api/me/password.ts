import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.PASSWORD_CHANGE;

type IPassword = { old_password: string; new_password: string };

type IPasswordReturn = {
  data: {};
  status: number;
};

export const useChangePassword = (language: Language) =>
  useMutation<IPasswordReturn, AxiosError, IPassword>(async (variables) => {
    const result = await Api.post(endpoint, variables, {
      headers: { "Accept-Language": language },
    });
    return {
      status: result.status,
      data: result.data,
    };
  });
