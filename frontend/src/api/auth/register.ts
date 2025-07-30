import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.REGISTER;

type IRegister = {
  email: string;
  password: string;
};

type IRegisterReturn = { data: Omit<IRegister, "password">; status: number };

export const useRegister = () =>
  useMutation<IRegisterReturn, AxiosError, IRegister>(async (variables) => {
    const result = await Api.post(endpoint, variables);
    return {
      status: result.status,
      data: result.data,
    };
  });
