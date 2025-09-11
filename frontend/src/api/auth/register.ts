import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useUserContext } from "src/components/user";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.REGISTER;

type IRegister = {
  email: string;
  password: string;
};

type IRegisterReturn = { data: Omit<IRegister, "password">; status: number };

export const useRegister = () => {
  const router = useRouter();
  const user = useUserContext();
  const localize = useLocalizedPath();
  return useMutation<IRegisterReturn, AxiosError, IRegister>(
    async (variables) => {
      const result = await Api.post(endpoint, variables);
      return {
        status: result.status,
        data: result.data,
      };
    },
    {
      onSuccess: (responseData) => {
        user.setState({ email: responseData.data.email });
        router.push(localize(paths.auth.activate));
      },
    }
  );
};
