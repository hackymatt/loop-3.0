import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useUserContext } from "src/components/user";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.LOGOUT;

type ILogout = {};

type ILogoutReturn = {
  data: {};
  status: number;
};

export const useLogout = () => {
  const router = useRouter();
  const user = useUserContext();
  const localize = useLocalizedPath();
  return useMutation<ILogoutReturn, AxiosError, ILogout>(
    async (variables) => {
      const result = await Api.post(endpoint, variables);
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
