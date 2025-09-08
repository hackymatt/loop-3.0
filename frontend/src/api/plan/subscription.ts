import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.CREATE_SUBSCRIPTION;

type ISubscription = {
  plan: string;
  currency: string;
  interval: string;
};

type ISubscriptionReturn = {
  data: { status: "succeeded" | "failed" };
  status: number;
};

export const useCreateSubscription = () =>
  useMutation<ISubscriptionReturn, AxiosError, ISubscription>(async (variables) => {
    const result = await Api.post(endpoint, variables);
    return {
      status: result.status,
      data: result.data,
    };
  });
