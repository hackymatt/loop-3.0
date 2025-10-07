import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { ClientApi } from "src/api/service";

import { useUserContext } from "src/components/user";

import { URLS } from "../urls";

const endpoint = URLS.ACTIVATE;

type IActivate = {
  token: string;
};

type IActivateReturn = { data: { email: string }; status: number };

export const useActivate = (language: Language) => {
  const router = useRouter();
  const user = useUserContext();
  const localize = useLocalizedPath();
  return useMutation<IActivateReturn, AxiosError, IActivate>(
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
        user.setField("isActive", true);
        router.push(localize(paths.auth.login));
      },
    }
  );
};
