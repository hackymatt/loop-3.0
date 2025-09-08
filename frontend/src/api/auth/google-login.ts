import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.LOGIN_GOOGLE;

type ILogin = {
  token: string;
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
  };
  status: number;
};

export const useLoginGoogle = (language: Language) =>
  useMutation<ILoginReturn, AxiosError, ILogin>(async (variables) => {
    const result = await Api.post(endpoint, variables, {
      headers: { "Accept-Language": language },
    });
    return {
      status: result.status,
      data: result.data,
    };
  });
