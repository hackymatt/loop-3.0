import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.PASSWORD_UPDATE;

type IPasswordUpdate = {
  token: string;
  password: string;
};

type IPasswordUpdateReturn = { data: { email: string }; status: number };

export const usePasswordUpdate = () => {
  const router = useRouter();
  const localize = useLocalizedPath();
  return useMutation<IPasswordUpdateReturn, AxiosError, IPasswordUpdate>(
    async (variables) => {
      const result = await Api.post(endpoint, variables);
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
