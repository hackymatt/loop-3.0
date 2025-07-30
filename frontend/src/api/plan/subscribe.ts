import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { Api } from "src/api/service";

const endpoint = URLS.SUBSCRIBE;

type ISubscribe = {
  plan: string;
  interval: "monthly" | "yearly" | null;
  currency: string;
  user: { first_name: string; last_name: string };
};

type ISubscribeReturn = {
  data: {
    type: string;
    license: string;
    interval: "monthly" | "yearly" | null;
    valid_to: string | null;
    price: number | null;
    currency: string;
  };
  status: number;
};

export const useSubscribe = (language: Language) =>
  useMutation<ISubscribeReturn, AxiosError, ISubscribe>(async (variables) => {
    const result = await Api.post(endpoint, variables, {
      headers: { "Accept-Language": language },
    });
    return {
      status: result.status,
      data: result.data,
    };
  });
