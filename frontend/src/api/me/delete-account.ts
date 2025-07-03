import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.DELETE_ACCOUNT;

type IDeleteAccount = {};

type IDeleteAccountReturn = {
  data: IDeleteAccount;
  status: number;
};

export const useDeleteAccount = () =>
  useMutation<IDeleteAccountReturn, AxiosError, IDeleteAccount>(async () => {
    const result = await Api.delete(endpoint);
    return {
      status: result.status,
      data: result.data,
    };
  });
