import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

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

export const useCreateSubscription = () => {
  const router = useRouter();
  const localize = useLocalizedPath();
  return useMutation<ISubscriptionReturn, AxiosError, ISubscription>(
    async (variables) => {
      const result = await Api.post(endpoint, variables);
      return {
        status: result.status,
        data: result.data,
      };
    },
    {
      onSuccess: (responseData) => {
        router.push(localize(`${paths.orderStatus}?status=${responseData.data.status}`));
      },
    }
  );
};
