import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.VALIDATE_COUPON;

type ICoupon = {
  code: string;
  plan: string;
};

type ICouponReturn = {
  data: { value: number; is_percentage: boolean };
  status: number;
};

export const useValidateCoupon = () =>
  useMutation<ICouponReturn, AxiosError, ICoupon>(async (variables) => {
    const result = await Api.post(endpoint, variables);
    return {
      status: result.status,
      data: result.data,
    };
  });
