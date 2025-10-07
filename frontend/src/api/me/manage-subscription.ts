import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { URLS } from "src/api/urls";
import { ClientApi } from "src/api/service";

type ICancelSubscription = {};

type ICancelSubscriptionReturn = { data: ICancelSubscription; status: number };

export const useCancelSubscription = (language: Language) => {
  const router = useRouter();
  const endpoint = URLS.CANCEL_SUBSCRIPTION;
  return useMutation<ICancelSubscriptionReturn, AxiosError, ICancelSubscription>(
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

export const useRenewSubscription = (language: Language) => {
  const router = useRouter();
  const endpoint = URLS.RENEW_SUBSCRIPTION;
  return useMutation<IRenewSubscriptionReturn, AxiosError, IRenewSubscription>(
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

export const useChangeSubscription = (language: Language) => {
  const router = useRouter();
  const endpoint = URLS.CHANGE_SUBSCRIPTION;
  return useMutation<IChangeSubscriptionReturn, AxiosError, IChangeSubscription>(
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
      onSuccess: () => {
        setTimeout(() => {
          router.refresh();
        }, 3000);
      },
    }
  );
};
