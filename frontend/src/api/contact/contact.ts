import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.CONTACT;

type ICreateContact = {
  full_name: string;
  email: string;
  subject: string;
  message: string;
};
type ICreateContactReturn = ICreateContact;

export const useContact = (language: Language) =>
  useMutation<ICreateContactReturn, AxiosError, ICreateContact>(async (variables) => {
    const result = await Api.post(endpoint, variables, {
      headers: { "Accept-Language": language },
    });
    return result.data;
  });
