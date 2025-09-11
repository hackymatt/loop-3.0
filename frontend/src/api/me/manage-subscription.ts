import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { URLS } from "src/api/urls";
import { Api } from "src/api/service";

type ICancelSubscription = {};

type ICancelSubscriptionReturn = { data: ICancelSubscription; status: number };

export const useCancelSubscription = () => {
  const router = useRouter();
  const endpoint = URLS.CANCEL_SUBSCRIPTION;
  return useMutation<ICancelSubscriptionReturn, AxiosError, ICancelSubscription>(
    async (variables) => {
      const result = await Api.post(endpoint, variables);
      return {
        status: result.status,
        data: result.data,
      };
    },
    {
      onSuccess: () => {
        setTimeout(() => {
          router.refresh();
        }, 3000);
      },
    }
  );
};

type IRenewSubscription = {};

type IRenewSubscriptionReturn = { data: IRenewSubscription; status: number };

export const useRenewSubscription = () => {
  const router = useRouter();
  const endpoint = URLS.RENEW_SUBSCRIPTION;
  return useMutation<IRenewSubscriptionReturn, AxiosError, IRenewSubscription>(
    async (variables) => {
      const result = await Api.post(endpoint, variables);
      return {
        status: result.status,
        data: result.data,
      };
    },
    {
      onSuccess: () => {
        setTimeout(() => {
          router.refresh();
        }, 3000);
      },
    }
  );
};

type IChangeSubscription = {
  plan: "free" | "basic" | "premium";
  currency: "PLN" | "EUR" | "USD" | "GBP";
  interval: "monthly" | "yearly";
};

type IChangeSubscriptionReturn = { data: IChangeSubscription; status: number };

export const useChangeSubscription = () => {
  const router = useRouter();
  const endpoint = URLS.CHANGE_SUBSCRIPTION;
  return useMutation<IChangeSubscriptionReturn, AxiosError, IChangeSubscription>(
    async (variables) => {
      const result = await Api.post(endpoint, variables);
      return {
        status: result.status,
        data: result.data,
      };
    },
    {
      onSuccess: () => {
        setTimeout(() => {
          router.refresh();
        }, 3000);
      },
    }
  );
};
