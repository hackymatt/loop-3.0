import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useUserContext } from "src/components/user";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.RESEND;

type IResend = {
  token?: string;
  email?: string;
};

type IResendReturn = { data: { email: string }; status: number };

export const useResend = () => {
  const router = useRouter();
  const user = useUserContext();
  const localize = useLocalizedPath();
  return useMutation<IResendReturn, AxiosError, IResend>(
    async (variables) => {
      const result = await Api.post(endpoint, variables);
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
