import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.PASSWORD_UPDATE;

type IPasswordUpdate = {
  token: string;
  password: string;
};

type IPasswordUpdateReturn = { data: { email: string }; status: number };

export const usePasswordUpdate = () =>
  useMutation<IPasswordUpdateReturn, AxiosError, IPasswordUpdate>(async (variables) => {
    const result = await Api.post(endpoint, variables);
    return {
      status: result.status,
      data: result.data,
    };
  });
