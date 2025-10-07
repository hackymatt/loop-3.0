import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useUserContext } from "src/components/user";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.LOGIN_FACEBOOK;

type ILogin = {
  access_token: string;
};

type IPlan = {
  type: "free" | "basic" | "premium";
  currency: string | null;
  interval: "month" | "year" | null;
};

type ILoginReturn = {
  data: {
    email: string;
    first_name: string;
    last_name: string;
    image: string | null;
    user_type: "admin" | "instructor" | "student";
    join_type: "email" | "google" | "facebook" | "github";
    is_active: boolean;
    plan: IPlan;
    trial_used: boolean;
    first_purchase: boolean;
  };
  status: number;
};

export const useLoginFacebook = (language: Language) => {
  const router = useRouter();
  const user = useUserContext();
  const { redirect } = user.state;
  const localize = useLocalizedPath();
  return useMutation<ILoginReturn, AxiosError, ILogin>(
    async (variables) => {
      const result = await Api.post(endpoint, variables, {
        headers: { "Accept-Language": language },
      });
      return {
        status: result.status,
        data: result.data,
      };
    },
    {
      onSuccess: (responseData) => {
        const {
          email,
          first_name,
          last_name,
          image,
          user_type,
          join_type,
          is_active,
          plan,
          trial_used,
          first_purchase,
        } = responseData.data;

        user.setState({
          isActive: is_active,
          isLoggedIn: true,
          email,
          firstName: first_name,
          lastName: last_name,
          avatarUrl: image,
          userType: user_type,
          joinType: join_type,
          plan,
          trialUsed: trial_used,
          firstPurchase: first_purchase,
          redirect: null,
        });

        setTimeout(() => {
          router.push(localize(redirect || paths.account.dashboard));
        }, 3000);
      },
    }
  );
};
