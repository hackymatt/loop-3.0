import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.LOGIN_FACEBOOK;

type ILogin = {
  access_token: string;
};

type IPlan = {
  type: "free" | "basic" | "premium";
  interval: "monthly" | "yearly" | null;
  valid_to: string | null;
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
  };
  status: number;
};

export const useLoginFacebook = () =>
  useMutation<ILoginReturn, AxiosError, ILogin>(async (variables) => {
    const result = await Api.post(endpoint, variables);
    return {
      status: result.status,
      data: result.data,
    };
  });
