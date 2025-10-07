import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { ClientApi } from "src/api/service";

import { URLS } from "../urls";

const endpoint = URLS.PAYMENT_METHODS;

type IData = {};

type IDataReturn = {
  data: {};
  status: number;
};

export const useEditPaymentMethod = (id: string, language: Language) => {
  const router = useRouter();
  const url = `${endpoint}/${id}`;
  return useMutation<IDataReturn, AxiosError, IData>(
    async (variables) => {
      const result = await ClientApi.put(url, variables, {
        headers: {
          "Accept-Language": language,
          "Content-Type": "multipart/form-data",
        },
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

export const useDeletePaymentMethod = (id: string, language: Language) => {
  const router = useRouter();
  const url = `${endpoint}/${id}`;
  return useMutation<IDataReturn, AxiosError, IData>(
    async () => {
      const result = await ClientApi.delete(url, {
        headers: {
          "Accept-Language": language,
        },
      });
      return {
        status: result.status,
        data: result.data,
      };
    },
    {
      onSuccess: () => {
        router.refresh();
      },
    }
  );
};
