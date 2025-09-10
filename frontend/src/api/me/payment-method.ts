import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.PAYMENT_METHODS;

type IData = {};

type IDataReturn = {
  data: {};
  status: number;
};

export const useEditPaymentMethod = (id: string) => {
  const router = useRouter();
  const url = `${endpoint}/${id}`;
  return useMutation<IDataReturn, AxiosError, IData>(
    async (variables) => {
      const result = await Api.put(url, variables, {
        headers: {
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

export const useDeletePaymentMethod = (id: string) => {
  const router = useRouter();
  const url = `${endpoint}/${id}`;
  return useMutation<IDataReturn, AxiosError, Omit<IData, "payment_method_id">>(
    async () => {
      const result = await Api.delete(url);
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
