import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { ClientApi } from "src/api/service";

import { URLS } from "../urls";

const endpoint = URLS.VALIDATE_COUPON;

type ICoupon = {
  code: string;
  plan: string;
  currency: string;
};

type ICouponReturn = {
  data: { value: number; is_percentage: boolean };
  status: number;
};

export const useValidateCoupon = (language: Language) =>
  useMutation<ICouponReturn, AxiosError, ICoupon>(async (variables) => {
    const result = await ClientApi.post(endpoint, variables, {
      headers: { "Accept-Language": language },
    });
    return {
      status: result.status,
      data: result.data,
    };
  });
