import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useUserContext } from "src/components/user";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.DELETE_ACCOUNT;

type IDeleteAccount = {};

type IDeleteAccountReturn = {
  data: IDeleteAccount;
  status: number;
};

export const useDeleteAccount = (language: Language) => {
  const router = useRouter();
  const user = useUserContext();
  const localize = useLocalizedPath();
  return useMutation<IDeleteAccountReturn, AxiosError, IDeleteAccount>(
    async () => {
      const result = await Api.delete(endpoint, {
        headers: { "Accept-Language": language },
      });
      return {
        status: result.status,
        data: result.data,
      };
    },
    {
      onSuccess: () => {
        user.resetState();
        router.push(localize(paths.home));
      },
    }
  );
};
