import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.CREATE_SETUP_INTENT;

type ISetupIntent = {};

type ISetupIntentReturn = {
  client_secret: string;
  customer_session_client_secret: string;
};

export const useCreateSetupIntent = () =>
  useMutation<ISetupIntentReturn, AxiosError, ISetupIntent>(async (variables) => {
    const { data } = await Api.post<ISetupIntentReturn>(endpoint, variables);
    return data;
  });
