import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.RESEND;

type IResend = {
  token?: string;
  email?: string;
};

type IResendReturn = { data: { email: string }; status: number };

export const useResend = () =>
  useMutation<IResendReturn, AxiosError, IResend>(async (variables) => {
    const result = await Api.post(endpoint, variables);
    return {
      status: result.status,
      data: result.data,
    };
  });
