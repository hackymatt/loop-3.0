import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { ClientApi } from "src/api/service";

import { URLS } from "../urls";

const endpoint = URLS.CREATE_SUBSCRIPTION;

type ISubscription = {
  plan: string;
  currency: string;
  interval: string;
  code: string | null;
};

type ISubscriptionReturn = {
  data: { status: "succeeded" | "failed" };
  status: number;
};

export const useCreateSubscription = (language: Language) => {
  const router = useRouter();
  const localize = useLocalizedPath();
  return useMutation<ISubscriptionReturn, AxiosError, ISubscription>(
    async (variables) => {
      const result = await ClientApi.post(endpoint, variables, {
        headers: { "Accept-Language": language },
      });
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
