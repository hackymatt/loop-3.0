import type { Language } from "src/locales/types";

import { cookies } from "next/headers";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.CREATE_SETUP_INTENT;

type ISetupIntentReturn = {
  client_secret: string;
  customer_session_client_secret: string;
};

export async function createSetupIntent(language: Language): Promise<ISetupIntentReturn> {
  try {
    const { data } = await Api.post<ISetupIntentReturn>(
      endpoint,
      {},
      {
        headers: { "Accept-Language": language, Cookie: cookies().toString() },
      }
    );
    return data;
  } catch (err) {
    if (err instanceof Error && err.message.includes("Access token expired")) {
      return Promise.reject({ code: "TOKEN_EXPIRED" });
    }
    return Promise.reject(err);
  }
}
