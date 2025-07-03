import type { AxiosError } from "axios";

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

export const useContact = () =>
  useMutation<ICreateContactReturn, AxiosError, ICreateContact>(async (variables) => {
    const result = await Api.post(endpoint, variables);
    return result.data;
  });
