import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";

import { useMutation } from "@tanstack/react-query";

import { ClientApi } from "src/api/service";

import { URLS } from "../urls";

const endpoint = URLS.CREATE_SETUP_INTENT;

type ISetupIntent = {};

type ISetupIntentReturn = {
  client_secret: string;
  customer_session_client_secret: string;
};

export const useCreateSetupIntent = (language: Language) =>
  useMutation<ISetupIntentReturn, AxiosError, ISetupIntent>(async (variables) => {
    const { data } = await ClientApi.post<ISetupIntentReturn>(endpoint, variables, {
      headers: { "Accept-Language": language },
    });
    return data;
  });
