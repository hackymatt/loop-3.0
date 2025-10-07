import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { useRouter } from "src/routes/hooks";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.DATA;

type IData = {
  first_name?: string | null;
  last_name?: string | null;
  image?: File | null;
  street_address?: string | null;
  zip_code?: string | null;
  city?: string | null;
  country?: string | null;
};

type IDataReturn = {
  data: Omit<IData, "image"> & { image: string | null };
  status: number;
};

export const useUpdateData = (language: Language) => {
  const router = useRouter();
  return useMutation<IDataReturn, AxiosError, IData>(
    async (variables) => {
      const result = await Api.patch(endpoint, variables, {
        headers: { "Accept-Language": language, "Content-Type": "multipart/form-data" },
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
