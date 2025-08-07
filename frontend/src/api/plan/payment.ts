import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.PAYMENT_INTENT;

type IPaymentIntent = {
  amount: number;
  currency: string;
};

type IPaymentIntentReturn = {
  data: {
    client_secret: string;
  };
  status: number;
};

export const useCreatePaymentIntent = (language: Language) =>
  useMutation<IPaymentIntentReturn, AxiosError, IPaymentIntent>(async (variables) => {
    const result = await Api.post(endpoint, variables, {
      headers: { "Accept-Language": language },
    });
    return {
      status: result.status,
      data: result.data,
    };
  });
