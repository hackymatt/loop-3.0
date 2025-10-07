import type { Language } from "src/locales/types";

import { cookies } from "next/headers";

import { ClientApi } from "src/api/service";

import { URLS } from "../urls";

const endpoint = URLS.CREATE_SETUP_INTENT;

type ISetupIntentReturn = {
  client_secret: string;
  customer_session_client_secret: string;
};

export async function createSetupIntent(language: Language): Promise<ISetupIntentReturn> {
  const { data } = await ClientApi.post<ISetupIntentReturn>(
    endpoint,
    {},
    {
      headers: { "Accept-Language": language, Cookie: cookies().toString() },
    }
  );
  return data;
}
