import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { ClientApi } from "src/api/service";

import { URLS } from "../urls";

const endpoint = URLS.PASSWORD_UPDATE;

type IPasswordUpdate = {
  token: string;
  password: string;
};

type IPasswordUpdateReturn = { data: { email: string }; status: number };

export const usePasswordUpdate = (language: Language) => {
  const router = useRouter();
  const localize = useLocalizedPath();
  return useMutation<IPasswordUpdateReturn, AxiosError, IPasswordUpdate>(
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
        router.push(localize(paths.auth.login));
      },
    }
  );
};
